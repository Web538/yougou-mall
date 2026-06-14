package com.yougou.order.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yougou.order.dto.CreateOrderDTO;
import com.yougou.order.dto.UpdateOrderStatusDTO;
import com.yougou.order.entity.Order;
import com.yougou.order.entity.OrderItem;
import com.yougou.order.entity.OrderLog;
import com.yougou.order.entity.OrderStatus;
import com.yougou.order.entity.OperateType;
import com.yougou.order.mapper.OrderItemMapper;
import com.yougou.order.mapper.OrderLogMapper;
import com.yougou.order.mapper.OrderMapper;
import com.yougou.order.service.OrderService;
import com.yougou.order.vo.OrderItemVO;
import com.yougou.order.vo.OrderPageVO;
import com.yougou.order.vo.OrderVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 订单服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final OrderLogMapper orderLogMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderVO createOrder(CreateOrderDTO dto) {
        log.info("创建订单，用户ID: {}", dto.getUserId());

        // 1. 生成订单编号
        String orderNo = generateOrderNo();

        // 2. 计算订单总金额
        BigDecimal totalAmount = dto.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. 计算实付金额
        BigDecimal payAmount = totalAmount.add(dto.getFreightAmount());

        // 4. 创建订单实体
        Order order = new Order();
        order.setId(IdUtil.getSnowflakeNextId());
        order.setOrderNo(orderNo);
        order.setUserId(dto.getUserId());
        order.setTotalAmount(totalAmount);
        order.setFreightAmount(dto.getFreightAmount());
        order.setPayAmount(payAmount);
        order.setStatus(OrderStatus.PENDING);
        order.setShippingName(dto.getShippingName());
        order.setShippingPhone(dto.getShippingPhone());
        order.setShippingProvince(dto.getShippingProvince());
        order.setShippingCity(dto.getShippingCity());
        order.setShippingDistrict(dto.getShippingDistrict());
        order.setShippingAddress(dto.getShippingAddress());
        order.setRemark(dto.getRemark());
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());

        // 5. 保存订单
        orderMapper.insert(order);

        // 6. 创建订单明细
        List<OrderItem> orderItems = dto.getItems().stream()
                .map(itemDTO -> {
                    OrderItem item = new OrderItem();
                    item.setId(IdUtil.getSnowflakeNextId());
                    item.setOrderId(order.getId());
                    item.setProductId(itemDTO.getProductId());
                    item.setProductName(itemDTO.getProductName());
                    item.setProductIcon(itemDTO.getProductIcon());
                    item.setSkuId(itemDTO.getSkuId());
                    item.setSkuName(itemDTO.getSkuName());
                    item.setPrice(itemDTO.getPrice());
                    item.setQuantity(itemDTO.getQuantity());
                    item.setSubtotal(itemDTO.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
                    item.setCreateTime(LocalDateTime.now());
                    item.setUpdateTime(LocalDateTime.now());
                    return item;
                })
                .collect(Collectors.toList());

        orderItemMapper.insertBatch(orderItems);

        // 7. 记录订单日志
        saveOrderLog(order.getId(), OperateType.CREATE, OperateType.getOperateMsg(OperateType.CREATE),
                dto.getUserId(), "用户");

        log.info("订单创建成功，订单号: {}", orderNo);
        return getOrderById(order.getId());
    }

    @Override
    public OrderVO getOrderById(Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            return null;
        }
        return enrichOrderVO(order);
    }

    @Override
    public OrderVO getOrderByOrderNo(String orderNo) {
        Order order = orderMapper.selectByOrderNo(orderNo);
        if (order == null) {
            return null;
        }
        return enrichOrderVO(order);
    }

    @Override
    public OrderPageVO getOrdersByUserId(Long userId, Integer page, Integer pageSize) {
        return getOrdersByUserIdAndStatus(userId, null, page, pageSize);
    }

    @Override
    public OrderPageVO getOrdersByUserIdAndStatus(Long userId, Integer status, Integer page, Integer pageSize) {
        Page<Order> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Order::getUserId, userId);
        if (status != null) {
            wrapper.eq(Order::getStatus, status);
        }
        wrapper.orderByDesc(Order::getCreateTime);

        Page<Order> result = orderMapper.selectPage(pageParam, wrapper);

        OrderPageVO pageVO = new OrderPageVO();
        pageVO.setList(result.getRecords().stream()
                .map(this::enrichOrderVO)
                .collect(Collectors.toList()));
        pageVO.setTotal(result.getTotal());
        pageVO.setPage((int) result.getCurrent());
        pageVO.setPageSize((int) result.getSize());
        pageVO.setTotalPages((int) result.getPages());

        return pageVO;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderVO updateOrderStatus(UpdateOrderStatusDTO dto) {
        Order order = orderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }

        // 状态流转校验
        validateStatusTransition(order.getStatus(), dto.getStatus());

        // 更新状态
        order.setStatus(dto.getStatus());
        order.setUpdateTime(LocalDateTime.now());

        // 如果是支付，更新支付时间
        if (dto.getStatus().equals(OrderStatus.PROCESSING)) {
            order.setPaymentTime(LocalDateTime.now());
            order.setPaymentMethod("ALIPAY"); // 默认支付宝
        }

        orderMapper.updateById(order);

        // 记录日志
        String operateType = getOperateTypeByStatus(dto.getStatus());
        saveOrderLog(order.getId(), operateType, OperateType.getOperateMsg(operateType),
                dto.getOperatorId(), dto.getOperatorName());

        log.info("订单状态更新成功，订单ID: {}, 新状态: {}", dto.getOrderId(), dto.getStatus());
        return getOrderById(order.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderVO cancelOrder(Long orderId, Long operatorId, String operatorName) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }

        // 只有待付款或待发货的订单可以取消
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PROCESSING) {
            throw new RuntimeException("当前状态不允许取消订单");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);

        saveOrderLog(order.getId(), OperateType.CANCEL, OperateType.getOperateMsg(OperateType.CANCEL),
                operatorId, operatorName);

        log.info("订单取消成功，订单ID: {}", orderId);
        return getOrderById(orderId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteOrder(Long orderId) {
        int rows = orderMapper.deleteById(orderId);
        return rows > 0;
    }

    // ==================== 私有方法 ====================

    /**
     * 丰富订单VO（包含明细）
     */
    private OrderVO enrichOrderVO(Order order) {
        OrderVO vo = OrderVO.fromEntity(order);

        // 查询订单明细
        List<OrderItem> items = orderItemMapper.selectByOrderId(order.getId());
        vo.setItems(items.stream()
                .map(OrderItemVO::fromEntity)
                .collect(Collectors.toList()));

        return vo;
    }

    /**
     * 生成订单编号
     */
    private String generateOrderNo() {
        String prefix = "ORD";
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%04d", (int) (Math.random() * 10000));
        return prefix + date + random;
    }

    /**
     * 保存订单日志
     */
    private void saveOrderLog(Long orderId, String operateType, String operateMsg, Long operatorId, String operatorName) {
        OrderLog log = new OrderLog();
        log.setId(IdUtil.getSnowflakeNextId());
        log.setOrderId(orderId);
        log.setOperateType(operateType);
        log.setOperateMsg(operateMsg);
        log.setOperatorId(operatorId);
        log.setOperatorName(operatorName);
        log.setCreateTime(LocalDateTime.now());
        orderLogMapper.insert(log);
    }

    /**
     * 根据状态获取操作类型
     */
    private String getOperateTypeByStatus(Integer status) {
        return switch (status) {
            case OrderStatus.PROCESSING -> OperateType.PAY;
            case OrderStatus.SHIPPED -> OperateType.SHIP;
            case OrderStatus.COMPLETED -> OperateType.RECEIVE;
            case OrderStatus.CANCELLED, OrderStatus.REFUNDED -> OperateType.CANCEL;
            default -> OperateType.CREATE;
        };
    }

    /**
     * 校验状态流转是否合法
     */
    private void validateStatusTransition(Integer currentStatus, Integer newStatus) {
        boolean valid = switch (currentStatus) {
            case OrderStatus.PENDING -> newStatus == OrderStatus.PROCESSING || newStatus == OrderStatus.CANCELLED;
            case OrderStatus.PROCESSING -> newStatus == OrderStatus.SHIPPED || newStatus == OrderStatus.REFUNDING;
            case OrderStatus.SHIPPED -> newStatus == OrderStatus.COMPLETED || newStatus == OrderStatus.REFUNDING;
            case OrderStatus.REFUNDING -> newStatus == OrderStatus.REFUNDED || newStatus == OrderStatus.SHIPPED;
            default -> false;
        };

        if (!valid) {
            throw new RuntimeException("非法状态流转: " + OrderStatus.getStatusText(currentStatus) + " -> " + OrderStatus.getStatusText(newStatus));
        }
    }
}

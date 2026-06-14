package com.yougou.order.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yougou.order.dto.CreateOrderDTO;
import com.yougou.order.dto.UpdateOrderStatusDTO;
import com.yougou.order.vo.OrderPageVO;
import com.yougou.order.vo.OrderVO;

/**
 * 订单服务接口
 */
public interface OrderService {

    /**
     * 创建订单
     */
    OrderVO createOrder(CreateOrderDTO dto);

    /**
     * 根据ID查询订单
     */
    OrderVO getOrderById(Long id);

    /**
     * 根据订单编号查询
     */
    OrderVO getOrderByOrderNo(String orderNo);

    /**
     * 根据用户ID查询订单列表（分页）
     */
    OrderPageVO getOrdersByUserId(Long userId, Integer page, Integer pageSize);

    /**
     * 根据用户ID查询订单列表（带状态筛选）
     */
    OrderPageVO getOrdersByUserIdAndStatus(Long userId, Integer status, Integer page, Integer pageSize);

    /**
     * 更新订单状态
     */
    OrderVO updateOrderStatus(UpdateOrderStatusDTO dto);

    /**
     * 取消订单
     */
    OrderVO cancelOrder(Long orderId, Long operatorId, String operatorName);

    /**
     * 删除订单（软删除）
     */
    boolean deleteOrder(Long orderId);
}

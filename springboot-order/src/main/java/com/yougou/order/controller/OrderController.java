package com.yougou.order.controller;

import com.yougou.order.common.Result;
import com.yougou.order.dto.CreateOrderDTO;
import com.yougou.order.dto.UpdateOrderStatusDTO;
import com.yougou.order.vo.OrderPageVO;
import com.yougou.order.vo.OrderVO;
import com.yougou.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 订单管理 Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ==================== 订单查询接口 ====================

    /**
     * 分页查询用户订单列表
     * GET /api/orders?userId=1001&page=1&pageSize=10
     */
    @GetMapping
    public Result<OrderPageVO> getOrders(
            @RequestParam Long userId,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        log.info("查询订单列表，用户ID: {}, 状态: {}, 页码: {}, 每页: {}", userId, status, page, pageSize);

        OrderPageVO result;
        if (status != null) {
            result = orderService.getOrdersByUserIdAndStatus(userId, status, page, pageSize);
        } else {
            result = orderService.getOrdersByUserId(userId, page, pageSize);
        }

        return Result.success(result);
    }

    /**
     * 根据ID查询订单详情
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public Result<OrderVO> getOrderById(@PathVariable Long id) {
        log.info("查询订单详情，ID: {}", id);

        OrderVO order = orderService.getOrderById(id);
        if (order == null) {
            return Result.error(404, "订单不存在");
        }

        return Result.success(order);
    }

    /**
     * 根据订单编号查询
     * GET /api/orders/no/{orderNo}
     */
    @GetMapping("/no/{orderNo}")
    public Result<OrderVO> getOrderByOrderNo(@PathVariable String orderNo) {
        log.info("查询订单详情，订单号: {}", orderNo);

        OrderVO order = orderService.getOrderByOrderNo(orderNo);
        if (order == null) {
            return Result.error(404, "订单不存在");
        }

        return Result.success(order);
    }

    // ==================== 订单创建接口 ====================

    /**
     * 创建订单
     * POST /api/orders
     */
    @PostMapping
    public Result<OrderVO> createOrder(@Valid @RequestBody CreateOrderDTO dto) {
        log.info("创建订单，用户ID: {}", dto.getUserId());

        try {
            OrderVO order = orderService.createOrder(dto);
            return Result.success("订单创建成功", order);
        } catch (Exception e) {
            log.error("创建订单失败", e);
            return Result.error("创建订单失败: " + e.getMessage());
        }
    }

    // ==================== 订单状态更新接口 ====================

    /**
     * 更新订单状态
     * PUT /api/orders/status
     */
    @PutMapping("/status")
    public Result<OrderVO> updateOrderStatus(@Valid @RequestBody UpdateOrderStatusDTO dto) {
        log.info("更新订单状态，订单ID: {}, 新状态: {}", dto.getOrderId(), dto.getStatus());

        try {
            OrderVO order = orderService.updateOrderStatus(dto);
            return Result.success("状态更新成功", order);
        } catch (Exception e) {
            log.error("更新订单状态失败", e);
            return Result.error("更新订单状态失败: " + e.getMessage());
        }
    }

    /**
     * 支付订单（快捷接口）
     * POST /api/orders/{id}/pay
     */
    @PostMapping("/{id}/pay")
    public Result<OrderVO> payOrder(@PathVariable Long id) {
        log.info("支付订单，ID: {}", id);

        try {
            UpdateOrderStatusDTO dto = new UpdateOrderStatusDTO();
            dto.setOrderId(id);
            dto.setStatus(1); // 待发货
            OrderVO order = orderService.updateOrderStatus(dto);
            return Result.success("支付成功", order);
        } catch (Exception e) {
            log.error("支付订单失败", e);
            return Result.error("支付失败: " + e.getMessage());
        }
    }

    /**
     * 取消订单
     * POST /api/orders/{id}/cancel
     */
    @PostMapping("/{id}/cancel")
    public Result<OrderVO> cancelOrder(
            @PathVariable Long id,
            @RequestParam(required = false) Long operatorId,
            @RequestParam(required = false) String operatorName) {

        log.info("取消订单，ID: {}", id);

        try {
            OrderVO order = orderService.cancelOrder(id, operatorId, operatorName);
            return Result.success("订单取消成功", order);
        } catch (Exception e) {
            log.error("取消订单失败", e);
            return Result.error("取消订单失败: " + e.getMessage());
        }
    }

    // ==================== 订单删除接口 ====================

    /**
     * 删除订单（软删除）
     * DELETE /api/orders/{id}
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteOrder(@PathVariable Long id) {
        log.info("删除订单，ID: {}", id);

        boolean success = orderService.deleteOrder(id);
        if (success) {
            return Result.success("订单删除成功", true);
        } else {
            return Result.error("订单删除失败");
        }
    }
}

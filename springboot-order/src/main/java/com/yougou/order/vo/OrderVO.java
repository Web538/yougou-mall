package com.yougou.order.vo;

import com.yougou.order.entity.Order;
import com.yougou.order.entity.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单视图对象
 */
@Data
public class OrderVO {

    private Long id;
    private String orderNo;
    private Long userId;
    private BigDecimal totalAmount;
    private BigDecimal freightAmount;
    private BigDecimal payAmount;
    private Integer status;
    private String statusText;
    private String paymentMethod;
    private LocalDateTime paymentTime;
    private String shippingName;
    private String shippingPhone;
    private String shippingProvince;
    private String shippingCity;
    private String shippingDistrict;
    private String shippingAddress;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<OrderItemVO> items;

    /**
     * 将实体转换为VO
     */
    public static OrderVO fromEntity(Order order) {
        OrderVO vo = new OrderVO();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setUserId(order.getUserId());
        vo.setTotalAmount(order.getTotalAmount());
        vo.setFreightAmount(order.getFreightAmount());
        vo.setPayAmount(order.getPayAmount());
        vo.setStatus(order.getStatus());
        vo.setStatusText(OrderStatus.getStatusText(order.getStatus()));
        vo.setPaymentMethod(order.getPaymentMethod());
        vo.setPaymentTime(order.getPaymentTime());
        vo.setShippingName(order.getShippingName());
        vo.setShippingPhone(order.getShippingPhone());
        vo.setShippingProvince(order.getShippingProvince());
        vo.setShippingCity(order.getShippingCity());
        vo.setShippingDistrict(order.getShippingDistrict());
        vo.setShippingAddress(order.getShippingAddress());
        vo.setRemark(order.getRemark());
        vo.setCreateTime(order.getCreateTime());
        vo.setUpdateTime(order.getUpdateTime());
        return vo;
    }
}

package com.yougou.order.vo;

import com.yougou.order.entity.OrderItem;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单明细视图对象
 */
@Data
public class OrderItemVO {

    private Long id;
    private Long orderId;
    private Long productId;
    private String productName;
    private String productIcon;
    private Long skuId;
    private String skuName;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
    private LocalDateTime createTime;

    /**
     * 将实体转换为VO
     */
    public static OrderItemVO fromEntity(OrderItem item) {
        OrderItemVO vo = new OrderItemVO();
        vo.setId(item.getId());
        vo.setOrderId(item.getOrderId());
        vo.setProductId(item.getProductId());
        vo.setProductName(item.getProductName());
        vo.setProductIcon(item.getProductIcon());
        vo.setSkuId(item.getSkuId());
        vo.setSkuName(item.getSkuName());
        vo.setPrice(item.getPrice());
        vo.setQuantity(item.getQuantity());
        vo.setSubtotal(item.getSubtotal());
        vo.setCreateTime(item.getCreateTime());
        return vo;
    }
}

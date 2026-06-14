package com.yougou.order.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 订单状态枚举
 */
public class OrderStatus {

    /** 待付款 */
    public static final int PENDING = 0;

    /** 待发货 */
    public static final int PROCESSING = 1;

    /** 待收货 */
    public static final int SHIPPED = 2;

    /** 已完成 */
    public static final int COMPLETED = 3;

    /** 已取消 */
    public static final int CANCELLED = 4;

    /** 退款中 */
    public static final int REFUNDING = 5;

    /** 已退款 */
    public static final int REFUNDED = 6;

    /**
     * 获取状态文本
     */
    public static String getStatusText(Integer status) {
        if (status == null) {
            return "未知";
        }
        return switch (status) {
            case PENDING -> "待付款";
            case PROCESSING -> "待发货";
            case SHIPPED -> "待收货";
            case COMPLETED -> "已完成";
            case CANCELLED -> "已取消";
            case REFUNDING -> "退款中";
            case REFUNDED -> "已退款";
            default -> "未知";
        };
    }
}

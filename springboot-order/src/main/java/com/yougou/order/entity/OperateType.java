package com.yougou.order.entity;

/**
 * 订单操作类型枚举
 */
public class OperateType {

    /** 创建订单 */
    public static final String CREATE = "CREATE";

    /** 支付订单 */
    public static final String PAY = "PAY";

    /** 发货 */
    public static final String SHIP = "SHIP";

    /** 收货 */
    public static final String RECEIVE = "RECEIVE";

    /** 取消订单 */
    public static final String CANCEL = "CANCEL";

    /** 退款 */
    public static final String REFUND = "REFUND";

    /**
     * 获取操作描述
     */
    public static String getOperateMsg(String type) {
        if (type == null) {
            return "未知操作";
        }
        return switch (type) {
            case CREATE -> "订单已创建";
            case PAY -> "订单已支付";
            case SHIP -> "商家已发货";
            case RECEIVE -> "用户已收货";
            case CANCEL -> "订单已取消";
            case REFUND -> "订单已退款";
            default -> "未知操作";
        };
    }
}

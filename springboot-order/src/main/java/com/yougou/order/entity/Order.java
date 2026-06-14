package com.yougou.order.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_order")
public class Order implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 订单ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 订单编号
     */
    private String orderNo;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 订单总金额（商品金额）
     */
    private BigDecimal totalAmount;

    /**
     * 运费金额
     */
    private BigDecimal freightAmount;

    /**
     * 实付金额
     */
    private BigDecimal payAmount;

    /**
     * 订单状态: 0-待付款 1-待发货 2-待收货 3-已完成 4-已取消 5-退款中 6-已退款
     */
    private Integer status;

    /**
     * 支付方式: WECHAT-微信 ALIPAY-支付宝 BANK_CARD-银行卡
     */
    private String paymentMethod;

    /**
     * 支付时间
     */
    private LocalDateTime paymentTime;

    /**
     * 收货人姓名
     */
    private String shippingName;

    /**
     * 收货人电话
     */
    private String shippingPhone;

    /**
     * 收货省份
     */
    private String shippingProvince;

    /**
     * 收货城市
     */
    private String shippingCity;

    /**
     * 收货区县
     */
    private String shippingDistrict;

    /**
     * 详细地址
     */
    private String shippingAddress;

    /**
     * 订单备注
     */
    private String remark;

    /**
     * 删除标记: 0-未删除 1-已删除
     */
    @TableLogic
    private Integer deleted;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 订单明细列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<OrderItem> items;
}

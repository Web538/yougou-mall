package com.yougou.order.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 订单操作日志实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_order_log")
public class OrderLog implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 日志ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 订单ID
     */
    private Long orderId;

    /**
     * 操作类型: CREATE-创建 PAY-支付 SHIP-发货 RECEIVE-收货 CANCEL-取消 REFUND-退款
     */
    private String operateType;

    /**
     * 操作描述
     */
    private String operateMsg;

    /**
     * 操作人ID
     */
    private Long operatorId;

    /**
     * 操作人名称
     */
    private String operatorName;

    /**
     * 操作时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}

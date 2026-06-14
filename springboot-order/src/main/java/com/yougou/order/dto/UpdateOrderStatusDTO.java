package com.yougou.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新订单状态请求DTO
 */
@Data
public class UpdateOrderStatusDTO {

    /**
     * 订单ID
     */
    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    /**
     * 目标状态
     */
    @NotNull(message = "目标状态不能为空")
    private Integer status;

    /**
     * 操作人ID
     */
    private Long operatorId;

    /**
     * 操作人名称
     */
    private String operatorName;

    /**
     * 备注
     */
    private String remark;
}

package com.yougou.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 创建订单请求DTO
 */
@Data
public class CreateOrderDTO {

    /**
     * 用户ID
     */
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    /**
     * 运费金额
     */
    private BigDecimal freightAmount = BigDecimal.ZERO;

    /**
     * 收货人姓名
     */
    @NotBlank(message = "收货人姓名不能为空")
    private String shippingName;

    /**
     * 收货人电话
     */
    @NotBlank(message = "收货人电话不能为空")
    private String shippingPhone;

    /**
     * 收货省份
     */
    @NotBlank(message = "收货省份不能为空")
    private String shippingProvince;

    /**
     * 收货城市
     */
    @NotBlank(message = "收货城市不能为空")
    private String shippingCity;

    /**
     * 收货区县
     */
    @NotBlank(message = "收货区县不能为空")
    private String shippingDistrict;

    /**
     * 详细地址
     */
    @NotBlank(message = "详细地址不能为空")
    private String shippingAddress;

    /**
     * 订单备注
     */
    private String remark;

    /**
     * 订单明细列表
     */
    @NotEmpty(message = "订单明细不能为空")
    @Valid
    private List<OrderItemDTO> items;

    @Data
    public static class OrderItemDTO {
        /**
         * 商品ID
         */
        @NotNull(message = "商品ID不能为空")
        private Long productId;

        /**
         * 商品名称
         */
        @NotBlank(message = "商品名称不能为空")
        private String productName;

        /**
         * 商品图标
         */
        private String productIcon;

        /**
         * SKU ID
         */
        private Long skuId;

        /**
         * SKU规格名称
         */
        private String skuName;

        /**
         * 商品单价
         */
        @NotNull(message = "商品单价不能为空")
        @Positive(message = "商品单价必须大于0")
        private BigDecimal price;

        /**
         * 购买数量
         */
        @NotNull(message = "购买数量不能为空")
        @Positive(message = "购买数量必须大于0")
        private Integer quantity;
    }
}

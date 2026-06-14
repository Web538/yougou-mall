package com.yougou.product.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 统一响应状态码枚举
 * <p>
 * 规范：
 * 1xx - 信息提示
 * 2xx - 成功
 * 4xx - 客户端错误（参数/权限/资源不存在）
 * 5xx - 服务器错误
 */
@Getter
@AllArgsConstructor
public enum ResultCode {

    // ========== 通用成功/失败 ==========
    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未登录或登录已过期，请重新登录"),
    FORBIDDEN(403, "无权限访问该资源"),
    NOT_FOUND(404, "请求的资源不存在"),
    INTERNAL_SERVER_ERROR(500, "服务器内部错误"),

    // ========== 参数校验错误 (42xx) ==========
    PARAM_IS_NULL(4201, "参数不能为空"),
    PARAM_FORMAT_ERROR(4202, "参数格式错误"),
    PARAM_INVALID(4203, "参数值无效"),
    PRODUCT_NAME_BLANK(4204, "商品名称不能为空"),
    PRODUCT_PRICE_INVALID(4205, "商品价格必须大于 0"),
    PRODUCT_STOCK_INVALID(4206, "商品库存不能为负数"),
    PRODUCT_CATEGORY_BLANK(4207, "商品分类不能为空"),
    PAGE_PARAM_INVALID(4208, "分页参数错误"),
    ID_IS_NULL(4209, "商品 ID 不能为空"),
    IDS_IS_NULL(4210, "商品 ID 列表不能为空"),

    // ========== 业务错误 (43xx) ==========
    PRODUCT_NOT_FOUND(4301, "商品不存在"),
    PRODUCT_NAME_EXIST(4302, "商品名称已存在，请更换"),
    PRODUCT_DELETE_FAILED(4303, "商品删除失败"),
    PRODUCT_UPDATE_FAILED(4304, "商品更新失败"),
    CATEGORY_NOT_FOUND(4305, "商品分类不存在"),
    PRODUCT_OFF_SHELF(4306, "商品已下架，无法操作"),
    PRODUCT_INSUFFICIENT_STOCK(4307, "商品库存不足");

    private final int code;
    private final String msg;
}

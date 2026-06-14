package com.yougou.product.common;

import lombok.Getter;

/**
 * 业务异常类
 * <p>
 * 用于在业务层主动抛出的异常，会被 GlobalExceptionHandler 统一捕获并转换为 JSON 响应。
 */
@Getter
public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 错误码（对应 ResultCode 枚举）
     */
    private final int code;

    /**
     * 构造器：使用 ResultCode 枚举
     */
    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMsg());
        this.code = resultCode.getCode();
    }

    /**
     * 构造器：使用 ResultCode 枚举 + 自定义消息（覆盖枚举消息）
     */
    public BusinessException(ResultCode resultCode, String customMsg) {
        super(customMsg);
        this.code = resultCode.getCode();
    }

    /**
     * 构造器：使用自定义错误码和消息
     */
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}

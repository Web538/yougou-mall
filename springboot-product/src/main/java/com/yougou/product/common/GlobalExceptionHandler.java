package com.yougou.product.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 * <p>
 * 统一捕获并处理所有异常，返回统一的 JSON 结构：
 * { "code": xxx, "msg": "xxx", "data": null, "timestamp": xxx }
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ==================== 1. 业务异常 ====================

    /** 业务异常（BusinessException） */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("[业务异常] code={}, msg={}", e.getCode(), e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    // ==================== 2. 参数校验异常 ====================

    /**
     * @Validated 实体参数校验异常
     * 根据字段名和注解类型返回更精确的业务码
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleMethodArgumentNotValid(MethodArgumentNotValidException e) {
        FieldError fieldError = e.getBindingResult().getFieldError();
        String field = fieldError != null ? fieldError.getField() : "unknown";
        String msg = fieldError != null ? fieldError.getDefaultMessage() : "参数校验失败";
        log.warn("[参数校验异常] field={}, msg={}", field, msg);

        // 根据字段名映射到精确的业务错误码
        int code = mapValidationFieldToCode(field);
        return Result.error(code, msg);
    }

    /** @Valid 实体绑定异常 */
    @ExceptionHandler(BindException.class)
    public Result<Void> handleBindException(BindException e) {
        FieldError fieldError = e.getBindingResult().getFieldError();
        String field = fieldError != null ? fieldError.getField() : "unknown";
        String msg = fieldError != null ? fieldError.getDefaultMessage() : "参数绑定失败";
        log.warn("[参数绑定异常] field={}, msg={}", field, msg);

        int code = mapValidationFieldToCode(field);
        return Result.error(code, msg);
    }

    /** 单个参数校验异常 */
    @ExceptionHandler(ConstraintViolationException.class)
    public Result<Void> handleConstraintViolation(ConstraintViolationException e) {
        Set<ConstraintViolation<?>> violations = e.getConstraintViolations();
        String msg = violations.stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining("; "));
        log.warn("[约束校验异常] msg={}", msg);
        return Result.error(ResultCode.PARAM_INVALID.getCode(), msg);
    }

    /** 请求参数缺失 */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public Result<Void> handleMissingServletRequestParameter(MissingServletRequestParameterException e) {
        String msg = "缺少必需参数: " + e.getParameterName();
        log.warn("[参数缺失] {}", msg);
        // 统一返回 PARAM_IS_NULL（4201）— 4209 用于实体参数的 id 字段校验
        return Result.error(ResultCode.PARAM_IS_NULL.getCode(), msg);
    }

    /** 请求参数类型不匹配 */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public Result<Void> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException e) {
        String msg = String.format("参数 '%s' 类型错误，期望值: %s",
                e.getName(), e.getRequiredType() != null ? e.getRequiredType().getSimpleName() : "未知");
        log.warn("[类型不匹配] {}", msg);
        return Result.error(ResultCode.PARAM_FORMAT_ERROR.getCode(), msg);
    }

    /** JSON 格式错误 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Result<Void> handleHttpMessageNotReadable(HttpMessageNotReadableException e) {
        log.warn("[JSON解析异常] {}", e.getMessage());
        return Result.error(ResultCode.PARAM_FORMAT_ERROR.getCode(), "请求体 JSON 格式错误，请检查参数格式");
    }

    /**
     * 将字段名映射到业务错误码
     */
    private int mapValidationFieldToCode(String field) {
        if (field == null || field.isBlank()) return ResultCode.BAD_REQUEST.getCode();
        switch (field.toLowerCase()) {
            case "name":     return ResultCode.PRODUCT_NAME_BLANK.getCode();
            case "price":    return ResultCode.PRODUCT_PRICE_INVALID.getCode();
            case "stock":    return ResultCode.PRODUCT_STOCK_INVALID.getCode();
            case "category": return ResultCode.PRODUCT_CATEGORY_BLANK.getCode();
            case "id":       return ResultCode.ID_IS_NULL.getCode();
            case "current":
            case "size":     return ResultCode.PAGE_PARAM_INVALID.getCode();
            default:         return ResultCode.BAD_REQUEST.getCode();
        }
    }

    // ==================== 3. HTTP 方法/资源异常 ====================

    /** 接口路径不存在（404） */
    @ExceptionHandler(NoHandlerFoundException.class)
    public Result<Void> handleNoHandlerFoundException(NoHandlerFoundException e) {
        String msg = "接口不存在: " + e.getRequestURL();
        log.warn("[接口不存在] method={}, url={}", e.getHttpMethod(), e.getRequestURL());
        return Result.error(ResultCode.NOT_FOUND.getCode(), msg);
    }

    /** 资源不存在（静态资源/路径变量异常，404） */
    @ExceptionHandler(NoResourceFoundException.class)
    public Result<Void> handleNoResourceFoundException(NoResourceFoundException e) {
        String msg = "资源不存在: " + e.getResourcePath();
        log.warn("[资源不存在] {}", msg);
        return Result.error(ResultCode.NOT_FOUND.getCode(), msg);
    }

    /** 请求方法不支持（405） */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public Result<Void> handleHttpRequestMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        String msg = "不支持的请求方法: " + e.getMethod();
        log.warn("[请求方法不支持] {}", msg);
        return Result.error(HttpStatus.METHOD_NOT_ALLOWED.value(), msg);
    }

    /** 媒体类型不支持（415） */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public Result<Void> handleHttpMediaTypeNotSupported(HttpMediaTypeNotSupportedException e) {
        String msg = "不支持的媒体类型: " + e.getContentType();
        log.warn("[媒体类型不支持] {}", msg);
        return Result.error(HttpStatus.UNSUPPORTED_MEDIA_TYPE.value(), msg);
    }

    // ==================== 4. 服务器内部异常 ====================

    /** 兜底异常（所有未处理异常） */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("[服务器内部异常] type={}, msg={}",
                e.getClass().getName(), e.getMessage(), e);
        return Result.error(ResultCode.INTERNAL_SERVER_ERROR.getCode(), "服务器内部错误，请稍后重试");
    }
}

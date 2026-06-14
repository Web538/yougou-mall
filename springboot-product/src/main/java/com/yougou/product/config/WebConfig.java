package com.yougou.product.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 全局配置
 * <p>
 * 配置说明：
 * 1. 通过 application.yml 配置 `spring.mvc.throw-exception-if-no-handler-found=true`
 *    和 `spring.web.resources.add-mappings=false`，让 Spring Boot 对不存在的接口抛出
 *    NoHandlerFoundException，由 GlobalExceptionHandler 统一处理。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // 如有需要（拦截器、CORS 等），在此扩展配置
}

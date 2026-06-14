package com.yougou.product.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis Plus 全局配置
 * <p>
 * 配置说明：
 * 1. 分页插件：PaginationInnerInterceptor
 *    - DbType.MYSQL：指定数据库为 MySQL
 *    - overflow：超出最大页时是否归零（false=不归零，返回空页）
 *    - maxLimit：单页最大条数限制（默认 500，设置为 100）
 */
@Configuration
public class MyBatisPlusConfig {

    /**
     * MyBatis Plus 拦截器（注册分页插件）
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 分页拦截器
        PaginationInnerInterceptor paginationInterceptor = new PaginationInnerInterceptor(DbType.MYSQL);
        paginationInterceptor.setOverflow(false);           // 不归零，继续查
        paginationInterceptor.setMaxLimit(100L);          // 单页最大 100 条

        interceptor.addInnerInterceptor(paginationInterceptor);

        return interceptor;
    }
}

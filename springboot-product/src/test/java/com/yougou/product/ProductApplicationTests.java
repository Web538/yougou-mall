package com.yougou.product;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ProductApplicationTests {

    @Test
    void contextLoads() {
        // 验证 Spring Boot 应用上下文能否正常加载
    }
}

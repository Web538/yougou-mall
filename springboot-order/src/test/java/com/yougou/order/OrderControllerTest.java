package com.yougou.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yougou.order.dto.CreateOrderDTO;
import com.yougou.order.entity.OrderStatus;
import com.yougou.order.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 订单接口集成测试
 */
@SpringBootTest
@AutoConfigureMockMvc
@Disabled
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ==================== 查询接口测试 ====================

    @Test
    void testListOrders_Success() throws Exception {
        mockMvc.perform(get("/api/orders")
                        .param("userId", "1001")
                        .param("page", "1")
                        .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"))
                .andExpect(jsonPath("$.data.list").isArray())
                .andExpect(jsonPath("$.data.total").isNumber())
                .andExpect(jsonPath("$.data.page").value(1));

        System.out.println("✅ GET /api/orders - 查询订单列表成功");
    }

    @Test
    void testListOrders_WithStatusFilter() throws Exception {
        mockMvc.perform(get("/api/orders")
                        .param("userId", "1001")
                        .param("status", "0")
                        .param("page", "1")
                        .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        System.out.println("✅ GET /api/orders?status=0 - 状态筛选查询成功");
    }

    @Test
    void testGetOrderById_Success() throws Exception {
        mockMvc.perform(get("/api/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.orderNo").value("ORD202606140001"))
                .andExpect(jsonPath("$.data.items").isArray());

        System.out.println("✅ GET /api/orders/{id} - 查询订单详情成功");
    }

    @Test
    void testGetOrderById_NotFound() throws Exception {
        mockMvc.perform(get("/api/orders/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").value("订单不存在"));

        System.out.println("✅ GET /api/orders/{id} - 订单不存在返回404");
    }

    @Test
    void testGetOrderByOrderNo_Success() throws Exception {
        mockMvc.perform(get("/api/orders/no/ORD202606140001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.orderNo").value("ORD202606140001"));

        System.out.println("✅ GET /api/orders/no/{orderNo} - 按订单号查询成功");
    }

    // ==================== 创建订单接口测试 ====================

    @Test
    void testCreateOrder_Success() throws Exception {
        String json = """
            {
                "userId": 7777,
                "freightAmount": 0.00,
                "shippingName": "接口测试",
                "shippingPhone": "13900007777",
                "shippingProvince": "测试省",
                "shippingCity": "测试市",
                "shippingDistrict": "测试区",
                "shippingAddress": "测试地址",
                "items": [
                    {
                        "productId": 7001,
                        "productName": "测试商品",
                        "price": 88.00,
                        "quantity": 1
                    }
                ]
            }
            """;

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("订单创建成功"))
                .andExpect(jsonPath("$.data.orderNo").isNotEmpty())
                .andExpect(jsonPath("$.data.totalAmount").value(88.00))
                .andExpect(jsonPath("$.data.status").value(0));

        System.out.println("✅ POST /api/orders - 创建订单成功");
    }

    @Test
    void testCreateOrder_ValidationError() throws Exception {
        // 缺少必填字段
        String json = """
            {
                "userId": 7777,
                "shippingName": "测试"
            }
            """;

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());

        System.out.println("✅ POST /api/orders - 参数校验失败返回400");
    }

    // ==================== 状态更新接口测试 ====================

    @Test
    void testPayOrder_Success() throws Exception {
        // 先创建订单
        String createJson = """
            {
                "userId": 6666,
                "shippingName": "支付测试",
                "shippingPhone": "13900006666",
                "shippingProvince": "支付省",
                "shippingCity": "支付市",
                "shippingDistrict": "支付区",
                "shippingAddress": "支付地址",
                "items": [
                    {"productId": 6001, "productName": "商品", "price": 100.00, "quantity": 1}
                ]
            }
            """;

        MvcResult createResult = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andReturn();

        String response = createResult.getResponse().getContentAsString();
        Long orderId = extractOrderId(response);

        // 支付订单
        mockMvc.perform(post("/api/orders/" + orderId + "/pay"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("支付成功"))
                .andExpect(jsonPath("$.data.status").value(1)); // 待发货

        System.out.println("✅ POST /api/orders/{id}/pay - 支付订单成功");
    }

    @Test
    void testCancelOrder_Success() throws Exception {
        // 先创建订单
        String createJson = """
            {
                "userId": 5555,
                "shippingName": "取消测试",
                "shippingPhone": "13900005555",
                "shippingProvince": "取消省",
                "shippingCity": "取消市",
                "shippingDistrict": "取消区",
                "shippingAddress": "取消地址",
                "items": [
                    {"productId": 5001, "productName": "商品", "price": 50.00, "quantity": 1}
                ]
            }
            """;

        MvcResult createResult = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andReturn();

        String response = createResult.getResponse().getContentAsString();
        Long orderId = extractOrderId(response);

        // 取消订单
        mockMvc.perform(post("/api/orders/" + orderId + "/cancel")
                        .param("operatorId", "5555")
                        .param("operatorName", "取消测试"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("订单取消成功"))
                .andExpect(jsonPath("$.data.status").value(4)); // 已取消

        System.out.println("✅ POST /api/orders/{id}/cancel - 取消订单成功");
    }

    // ==================== 删除接口测试 ====================

    @Test
    void testDeleteOrder_Success() throws Exception {
        // 创建订单
        String createJson = """
            {
                "userId": 4444,
                "shippingName": "删除测试",
                "shippingPhone": "13900004444",
                "shippingProvince": "删除省",
                "shippingCity": "删除市",
                "shippingDistrict": "删除区",
                "shippingAddress": "删除地址",
                "items": [
                    {"productId": 4001, "productName": "商品", "price": 30.00, "quantity": 1}
                ]
            }
            """;

        MvcResult createResult = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andReturn();

        String response = createResult.getResponse().getContentAsString();
        Long orderId = extractOrderId(response);

        // 删除订单
        mockMvc.perform(delete("/api/orders/" + orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("订单删除成功"));

        System.out.println("✅ DELETE /api/orders/{id} - 删除订单成功");
    }

    // ==================== 辅助方法 ====================

    private Long extractOrderId(String json) {
        try {
            com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(json);
            return node.path("data").path("id").asLong();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}

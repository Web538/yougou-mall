package com.yougou.order;

import com.yougou.order.dto.CreateOrderDTO;
import com.yougou.order.entity.OrderStatus;
import com.yougou.order.service.OrderService;
import com.yougou.order.vo.OrderPageVO;
import com.yougou.order.vo.OrderVO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 订单服务单元测试
 */
@SpringBootTest
class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    // ==================== 创建订单测试 ====================

    @Test
    void testCreateOrder_Success() {
        // 准备数据
        CreateOrderDTO dto = new CreateOrderDTO();
        dto.setUserId(1001L);
        dto.setFreightAmount(BigDecimal.ZERO);
        dto.setShippingName("测试用户");
        dto.setShippingPhone("13900000000");
        dto.setShippingProvince("广东省");
        dto.setShippingCity("深圳市");
        dto.setShippingDistrict("南山区");
        dto.setShippingAddress("科技园路1号");

        CreateOrderDTO.OrderItemDTO item = new CreateOrderDTO.OrderItemDTO();
        item.setProductId(1001L);
        item.setProductName("测试商品");
        item.setPrice(new BigDecimal("99.00"));
        item.setQuantity(2);
        dto.setItems(List.of(item));

        // 执行
        OrderVO result = orderService.createOrder(dto);

        // 验证
        assertNotNull(result);
        assertNotNull(result.getId());
        assertNotNull(result.getOrderNo());
        assertEquals(1001L, result.getUserId());
        assertEquals(new BigDecimal("198.00"), result.getTotalAmount());
        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals("待付款", result.getStatusText());
        assertNotNull(result.getItems());
        assertEquals(1, result.getItems().size());

        System.out.println("✅ 创建订单成功: " + result.getOrderNo());
    }

    @Test
    void testCreateOrder_WithMultipleItems() {
        CreateOrderDTO dto = new CreateOrderDTO();
        dto.setUserId(1002L);
        dto.setFreightAmount(new BigDecimal("10.00"));
        dto.setShippingName("多商品用户");
        dto.setShippingPhone("13900000001");
        dto.setShippingProvince("浙江省");
        dto.setShippingCity("杭州市");
        dto.setShippingDistrict("西湖区");
        dto.setShippingAddress("西湖大道100号");

        List<CreateOrderDTO.OrderItemDTO> items = new ArrayList<>();

        CreateOrderDTO.OrderItemDTO item1 = new CreateOrderDTO.OrderItemDTO();
        item1.setProductId(1001L);
        item1.setProductName("商品A");
        item1.setPrice(new BigDecimal("100.00"));
        item1.setQuantity(2);
        items.add(item1);

        CreateOrderDTO.OrderItemDTO item2 = new CreateOrderDTO.OrderItemDTO();
        item2.setProductId(1002L);
        item2.setProductName("商品B");
        item2.setPrice(new BigDecimal("50.00"));
        item2.setQuantity(3);
        items.add(item2);

        dto.setItems(items);

        OrderVO result = orderService.createOrder(dto);

        assertNotNull(result);
        // 商品A: 100*2=200, 商品B: 50*3=150, 合计350
        assertEquals(new BigDecimal("350.00"), result.getTotalAmount()); // 商品总金额
        assertEquals(new BigDecimal("360.00"), result.getPayAmount());   // + 运费10
        assertEquals(2, result.getItems().size());

        System.out.println("✅ 多商品订单创建成功");
    }

    // ==================== 查询订单测试 ====================

    @Test
    void testGetOrderById_Success() {
        OrderVO result = orderService.getOrderById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("ORD202606140001", result.getOrderNo());
        assertNotNull(result.getItems());

        System.out.println("✅ 查询订单成功: " + result.getOrderNo());
    }

    @Test
    void testGetOrderById_NotFound() {
        OrderVO result = orderService.getOrderById(999999L);
        assertNull(result);
        System.out.println("✅ 查询不存在订单返回null");
    }

    @Test
    void testGetOrderByOrderNo_Success() {
        OrderVO result = orderService.getOrderByOrderNo("ORD202606140001");

        assertNotNull(result);
        assertEquals("ORD202606140001", result.getOrderNo());
        System.out.println("✅ 按订单号查询成功");
    }

    @Test
    void testGetOrdersByUserId_Success() {
        OrderPageVO result = orderService.getOrdersByUserId(1001L, 1, 10);

        assertNotNull(result);
        assertNotNull(result.getList());
        assertTrue(result.getList().size() >= 2); // 用户1001有2个订单

        System.out.println("✅ 用户订单列表查询成功，数量: " + result.getList().size());
    }

    @Test
    void testGetOrdersByUserIdAndStatus_Success() {
        // 查询待付款订单
        OrderPageVO result = orderService.getOrdersByUserIdAndStatus(1001L, OrderStatus.PENDING, 1, 10);

        assertNotNull(result);
        for (OrderVO order : result.getList()) {
            assertEquals(OrderStatus.PENDING, order.getStatus());
        }

        System.out.println("✅ 状态筛选查询成功，待付款订单数: " + result.getList().size());
    }

    // ==================== 状态更新测试 ====================

    @Test
    void testPayOrder_Success() {
        // 创建一个待付款订单
        CreateOrderDTO dto = new CreateOrderDTO();
        dto.setUserId(9999L);
        dto.setFreightAmount(BigDecimal.ZERO);
        dto.setShippingName("支付测试");
        dto.setShippingPhone("13900000999");
        dto.setShippingProvince("测试省");
        dto.setShippingCity("测试市");
        dto.setShippingDistrict("测试区");
        dto.setShippingAddress("测试地址");

        CreateOrderDTO.OrderItemDTO item = new CreateOrderDTO.OrderItemDTO();
        item.setProductId(9001L);
        item.setProductName("支付测试商品");
        item.setPrice(new BigDecimal("99.00"));
        item.setQuantity(1);
        dto.setItems(List.of(item));

        OrderVO newOrder = orderService.createOrder(dto);
        assertEquals(OrderStatus.PENDING, newOrder.getStatus());

        // 支付订单
        com.yougou.order.dto.UpdateOrderStatusDTO statusDTO = new com.yougou.order.dto.UpdateOrderStatusDTO();
        statusDTO.setOrderId(newOrder.getId());
        statusDTO.setStatus(OrderStatus.PROCESSING); // 待发货
        statusDTO.setOperatorId(9999L);
        statusDTO.setOperatorName("支付测试");

        OrderVO paidOrder = orderService.updateOrderStatus(statusDTO);

        assertEquals(OrderStatus.PROCESSING, paidOrder.getStatus());
        assertNotNull(paidOrder.getPaymentTime());
        System.out.println("✅ 订单支付成功");
    }

    @Test
    void testCancelOrder_Success() {
        // 创建并取消订单
        CreateOrderDTO dto = new CreateOrderDTO();
        dto.setUserId(8888L);
        dto.setFreightAmount(BigDecimal.ZERO);
        dto.setShippingName("取消测试");
        dto.setShippingPhone("13900000888");
        dto.setShippingProvince("取消省");
        dto.setShippingCity("取消市");
        dto.setShippingDistrict("取消区");
        dto.setShippingAddress("取消地址");

        CreateOrderDTO.OrderItemDTO item = new CreateOrderDTO.OrderItemDTO();
        item.setProductId(8001L);
        item.setProductName("取消测试商品");
        item.setPrice(new BigDecimal("50.00"));
        item.setQuantity(1);
        dto.setItems(List.of(item));

        OrderVO newOrder = orderService.createOrder(dto);

        OrderVO cancelledOrder = orderService.cancelOrder(newOrder.getId(), 8888L, "取消测试");

        assertEquals(OrderStatus.CANCELLED, cancelledOrder.getStatus());
        System.out.println("✅ 订单取消成功");
    }

    // ==================== 边界测试 ====================

    @Test
    void testGetOrders_Pagination() {
        // 分页测试
        OrderPageVO page1 = orderService.getOrdersByUserId(1001L, 1, 1);
        OrderPageVO page2 = orderService.getOrdersByUserId(1001L, 2, 1);

        assertNotNull(page1);
        assertNotNull(page2);
        assertEquals(1, page1.getList().size());
        assertEquals(1, page2.getList().size());
        assertNotEquals(page1.getList().get(0).getId(), page2.getList().get(0).getId());

        System.out.println("✅ 分页查询成功");
    }

    @Test
    void testOrderStatusText() {
        assertEquals("待付款", OrderStatus.getStatusText(OrderStatus.PENDING));
        assertEquals("待发货", OrderStatus.getStatusText(OrderStatus.PROCESSING));
        assertEquals("待收货", OrderStatus.getStatusText(OrderStatus.SHIPPED));
        assertEquals("已完成", OrderStatus.getStatusText(OrderStatus.COMPLETED));
        assertEquals("已取消", OrderStatus.getStatusText(OrderStatus.CANCELLED));
        assertEquals("退款中", OrderStatus.getStatusText(OrderStatus.REFUNDING));
        assertEquals("已退款", OrderStatus.getStatusText(OrderStatus.REFUNDED));
        assertEquals("未知", OrderStatus.getStatusText(99));

        System.out.println("✅ 订单状态文本转换正确");
    }
}

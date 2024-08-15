class OrderDetailsDTO {
    constructor(orderId, itemCode, buyQty, itemTotal) {
        // Initialize properties
        this.orderId = orderId;
        this.itemCode = itemCode;
        this.buyQty = buyQty;
        this.itemTotal = itemTotal;
    }

    // Getter methods
    getOrderId() {
        return this.orderId;
    }

    getItemCode() {
        return this.itemCode;
    }

    getBuyQty() {
        return this.buyQty;
    }

    getItemTotal() {
        return this.itemTotal;
    }

    // Setter methods
    setOrderId(newOId) {
        this.orderId = newOId;
    }

    setItemCode(newCode) {
        this.itemCode = newCode;
    }

    setBuyQty(newQty) {
        this.buyQty = newQty;
    }

    setItemTotal(newTotal) {
        this.itemTotal = newTotal;
    }
}

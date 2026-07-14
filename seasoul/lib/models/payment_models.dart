class PaymentOrderResponse {
  final String id;
  final String entity;
  final int amount;
  final int amountPaid;
  final int amountDue;
  final String currency;
  final String receipt;
  final String status;
  final int attempts;
  final Map<String, dynamic>? notes;
  final int createdAt;

  PaymentOrderResponse({
    required this.id,
    required this.entity,
    required this.amount,
    required this.amountPaid,
    required this.amountDue,
    required this.currency,
    required this.receipt,
    required this.status,
    required this.attempts,
    this.notes,
    required this.createdAt,
  });

  factory PaymentOrderResponse.fromJson(Map<String, dynamic> json) {
    return PaymentOrderResponse(
      id: json['id'],
      entity: json['entity'],
      amount: json['amount'],
      amountPaid: json['amount_paid'],
      amountDue: json['amount_due'],
      currency: json['currency'],
      receipt: json['receipt'],
      status: json['status'],
      attempts: json['attempts'],
      notes: json['notes'],
      createdAt: json['created_at'],
    );
  }
}

class PaymentVerificationRequest {
  final String orderId;
  final String paymentId;
  final String signature;

  PaymentVerificationRequest({
    required this.orderId,
    required this.paymentId,
    required this.signature,
  });

  Map<String, dynamic> toJson() {
    return {
      'razorpay_order_id': orderId,
      'razorpay_payment_id': paymentId,
      'razorpay_signature': signature,
    };
  }
}
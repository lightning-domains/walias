import { NextRequest, NextResponse } from "next/server";
import debug from "debug";

const log = debug("app:walias-payment-verification");

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string; verificationId: string } }
) {
  try {
    const { domain, verificationId } = params;
    log(
      "Verifying payment for domain: %s, verificationId: %s",
      domain,
      verificationId
    );

    // Here, you would implement your actual payment verification logic
    // This might involve checking a database or calling an external payment service
    // For this example, we'll use a mock implementation

    const paymentStatus = await mockCheckPaymentStatus(verificationId);

    if (paymentStatus.settled) {
      return NextResponse.json({
        status: "OK",
        settled: true,
        preimage: paymentStatus.preimage,
        pr: paymentStatus.pr,
      });
    } else {
      return NextResponse.json(
        {
          status: "OK",
          settled: false,
          pr: paymentStatus.pr,
        },
        { status: 402 }
      ); // 402 Payment Required
    }
  } catch (error) {
    log("Error while verifying walias payment: %O", error);
    return NextResponse.json(
      {
        status: "ERROR",
        reason: "Payment verification failed",
      },
      { status: 500 }
    );
  }
}

// Mock function to simulate payment status check
async function mockCheckPaymentStatus(verificationId: string) {
  // In a real implementation, you would check your database or payment service here
  const settled = Math.random() < 0.5; // Randomly decide if payment is settled
  return {
    settled,
    preimage: settled ? "mocked_preimage_" + verificationId : null,
    pr:
      "lnbc1500n1ps36h3hpp5ccp6y5nzn2mzx8kfwef5ulncn8qcnu409" + verificationId,
  };
}

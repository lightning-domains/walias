import { NextRequest, NextResponse } from "next/server";
import { WalletsService } from "@/services/wallets";
import debug from "debug";
import { ErrorResponse } from "@/types/requests/shared";
import { WalletUpdateSchema } from "@/types/requests/wallets";

const log = debug("app:api:wallets:route");

// GET: Retrieve Wallet
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const walletService = new WalletsService();

  try {
    const { id } = params;
    log("Received request to retrieve wallet: %s", id);

    const wallet = await walletService.findWalletById(id);
    if (!wallet) {
      return NextResponse.json(
        { reason: "Wallet not found" } as ErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(wallet);
  } catch (error) {
    log("Error while retrieving wallet: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}

// PUT: Update Wallet
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const walletService = new WalletsService();

  try {
    const { id } = params;
    log("Received request to update wallet: %s", id);

    const body = await req.json();

    const parseResult = WalletUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((e) => e.message)
        .join(", ");
      log("Invalid input for wallet %s: %s", id, errorMessages);
      return NextResponse.json(
        { reason: `Invalid input: ${errorMessages}` } as ErrorResponse,
        { status: 400 }
      );
    }

    const updatedWallet = await walletService.updateWallet(
      id,
      parseResult.data
    );

    if (!updatedWallet) {
      return NextResponse.json(
        { reason: "Wallet not found" } as ErrorResponse,
        { status: 404 }
      );
    }

    log("Successfully updated wallet: %s", id);
    return NextResponse.json(updatedWallet);
  } catch (error) {
    log("Error while updating wallet: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}

// DELETE: Delete Wallet
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const walletService = new WalletsService();

  try {
    const { id } = params;
    log("Received request to delete wallet: %s", id);

    await walletService.deleteWallet(id);

    log("Successfully deleted wallet: %s", id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    log("Error while deleting wallet: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}

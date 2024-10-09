import { NextRequest, NextResponse } from "next/server";
import { UsersService } from "@/services/users";
import debug from "debug";
import { ErrorResponse } from "@/types/requests/shared";
import { UserUpdateSchema } from "@/types/requests/users";
import { isValidKey } from "@/lib/utils";

const log = debug("app:api:users:route");

// GET: Retrieve User
export async function GET(
  req: NextRequest,
  { params }: { params: { pubkey: string } }
) {
  const usersService = new UsersService();

  try {
    const { pubkey } = params;
    log("Received request to retrieve user: %s", pubkey);

    // Validate pubkey format
    if (!isValidKey(pubkey)) {
      log("Invalid pubkey format: %s", pubkey);
      return NextResponse.json(
        { reason: "Invalid pubkey format" } as ErrorResponse,
        { status: 400 }
      );
    }

    const user = await usersService.findUserByPubkey(pubkey);
    if (!user) {
      return NextResponse.json({ reason: "User not found" } as ErrorResponse, {
        status: 404,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    log("Error while retrieving user: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}

// PUT: Update User
export async function PUT(
  req: NextRequest,
  { params }: { params: { pubkey: string } }
) {
  const usersService = new UsersService();

  try {
    const { pubkey } = params;
    log("Received request to update user: %s", pubkey);

    const body = await req.json();

    const parseResult = UserUpdateSchema.safeParse(body);

    if (!parseResult.success || !isValidKey(pubkey)) {
      const errorMessages = parseResult.error?.errors
        .map((e) => e.message)
        .join(", ");
      log("Invalid input for user %s: %s", pubkey, errorMessages);
      return NextResponse.json(
        {
          reason: !isValidKey(pubkey)
            ? "Invalid pubkey format"
            : `Invalid input: ${errorMessages}`,
        } as ErrorResponse,
        { status: 400 }
      );
    }

    const { relays } = parseResult.data;

    const updatedUser = await usersService.updateUserRelays(pubkey, relays);

    if (!updatedUser) {
      return NextResponse.json({ reason: "User not found" } as ErrorResponse, {
        status: 404,
      });
    }

    log("Successfully updated user: %s", pubkey);
    return NextResponse.json(updatedUser);
  } catch (error) {
    log("Error while updating user: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}

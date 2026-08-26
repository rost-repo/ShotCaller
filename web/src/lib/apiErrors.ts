import { NextResponse } from "next/server";
import { SessionConfigurationError } from "@/lib/sessions";

export function toApiErrorResponse(error: unknown): NextResponse | null {
    if (error instanceof SessionConfigurationError) {
        return NextResponse.json(
            { error: "server configuration error" },
            { status: 503 },
        );
    }

    return null;
}

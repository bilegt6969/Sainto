//web/src/app/api/create

import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// Configure Sanity client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "c7bxnoyq",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false
});

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // Basic validation
    if (!orderData.orderNumber || !orderData.transferCode) {
      return NextResponse.json(
        { success: false, message: 'Order number and transfer code are required' },
        { status: 400 }
      );
    }

    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Create order in Sanity
    const createdOrder = await sanityClient.create({
      _type: 'order',
      ...orderData,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        success: true, 
        orderId: createdOrder._id,
        orderNumber: createdOrder.orderNumber
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating order:', error);
    const errorWithMessage = toErrorWithMessage(error);
    return NextResponse.json(
      { 
        success: false, 
        message: errorWithMessage.message 
      },
      { status: 500 }
    );
  }
}
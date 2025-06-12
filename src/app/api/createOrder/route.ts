//web/src/app/api/createOrder/route.ts

import { NextResponse } from 'next/server';

// Your Discord Webhook URL
const webhookUrl = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1382680453835657237/uTlQfIFGK7BhX5ErU2dq3VV16SJe1_FQeqLK0mZB-9bx0Fqtz5Rj54_hBr1v9g6EZU0P";

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
    return new Error(String(maybeError));
  }
}

// Helper to format currency
const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}₮`;
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // Basic validation (remains the same)
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

    // --- Start of Discord Integration ---

    // 1. Format the items into a readable string for the Discord embed
    const itemsDescription = orderData.items.map((item: any) => {
      const itemTotal = formatCurrency(item.price * item.quantity);
      return `**${item.name}**\n- Хэмжээ: ${item.size}\n- Тоо: ${item.quantity}\n- Үнэ: ${itemTotal}`;
    }).join('\n\n');

    // 2. Construct the Discord embed payload
    const discordPayload = {
      username: "Tsuifu Order Bot",
      avatar_url: "https://i.imgur.com/gA3v3cW.png", // You can change this to your shop's logo
      embeds: [
        {
          title: `Шинэ захиалга: #${orderData.orderNumber}`,
          color: 3447003, // A nice blue color
          timestamp: new Date().toISOString(),
          fields: [
            // Customer and Address Info
            {
              name: "👤 Хэрэглэгчийн мэдээлэл",
              value: `**Нэр:** ${orderData.customerName}\n**Утас:** ${orderData.phone}\n**И-мэйл:** ${orderData.email}`,
              inline: false,
            },
            {
              name: "🚚 Хүргэлтийн хаяг",
              value: `${orderData.province}, ${orderData.district}, ${orderData.address}`,
              inline: false,
            },
            // Divider
            { name: '\u200B', value: '\u200B' },
            // Payment Info
            {
              name: "💳 Төлбөрийн мэдээлэл",
              value: `**Банк:** ${orderData.bankName}\n**Гүйлгээний утга:** \`${orderData.transferCode}\``,
              inline: true,
            },
            {
                name: "💰 Нийт дүн",
                value: `**${formatCurrency(orderData.totalAmount)}**`,
                inline: true,
            },
             // Divider
            { name: '\u200B', value: '\u200B' },
            // Items
            {
              name: "🛒 Бараанууд",
              value: itemsDescription,
              inline: false,
            },
            // Order Summary
            {
              name: "📋 Дүн",
              value: `**Барааны дүн:** ${formatCurrency(orderData.subtotal)}\n**Хүргэлт:** ${formatCurrency(orderData.deliveryFee)}\n**Шимтгэл:** ${formatCurrency(orderData.commissionFee)}`,
              inline: false
            }
          ],
          footer: {
            text: `Захиалгын төлөв: ${orderData.orderStatus}`,
          },
        },
      ],
    };

    // 3. Send the data to your Discord webhook
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    // Check if the webhook post was successful
    if (!discordResponse.ok) {
      console.error('Failed to send order to Discord:', discordResponse.status, await discordResponse.text());
      // Even if Discord fails, we can still proceed to not break the user flow
      // Or you could return an error:
      // throw new Error('Could not post order to notification channel.');
    }

    // --- End of Discord Integration ---

    // Return a success response to the frontend, maintaining the original format.
    // The frontend expects `orderId` and `orderNumber`. We'll use the orderNumber for both.
    return NextResponse.json(
      {
        success: true,
        orderId: orderData.orderNumber, // Or generate a unique ID if you need one
        orderNumber: orderData.orderNumber
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
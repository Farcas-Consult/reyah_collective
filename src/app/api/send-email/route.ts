import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, orderNumber, customerName, items, total, trackingNumber } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'Reyah Collective <noreply@reyahcollective.com>',
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #FAF8F3;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; background-color: #8B7355; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Reyah Collective</h1>
                        <p style="margin: 10px 0 0 0; color: #F5F5DC; font-size: 16px;">Order Confirmation</p>
                      </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px 0; color: #3E2723; font-size: 24px;">Thank you, ${customerName}!</h2>
                        <p style="margin: 0 0 20px 0; color: #5D4037; font-size: 16px; line-height: 1.5;">
                          Your order has been successfully placed and is being processed. We'll send you another email when your items ship.
                        </p>

                        <!-- Order Details Box -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FAF8F3; border-radius: 6px; margin: 30px 0;">
                          <tr>
                            <td style="padding: 20px;">
                              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <strong style="color: #3E2723;">Order Number:</strong>
                                  </td>
                                  <td align="right" style="padding: 8px 0;">
                                    <span style="color: #8B7355; font-weight: bold;">${orderNumber}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <strong style="color: #3E2723;">Order Date:</strong>
                                  </td>
                                  <td align="right" style="padding: 8px 0;">
                                    <span style="color: #5D4037;">${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                  </td>
                                </tr>
                                ${trackingNumber ? `
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <strong style="color: #3E2723;">Tracking Number:</strong>
                                  </td>
                                  <td align="right" style="padding: 8px 0;">
                                    <span style="color: #5D4037; font-family: monospace;">${trackingNumber}</span>
                                  </td>
                                </tr>
                                ` : ''}
                              </table>
                            </td>
                          </tr>
                        </table>

                        <!-- Order Items -->
                        <h3 style="margin: 30px 0 15px 0; color: #3E2723; font-size: 18px;">Order Items</h3>
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          ${items.map((item: any) => `
                            <tr style="border-bottom: 1px solid #F5F5DC;">
                              <td style="padding: 15px 0;">
                                <strong style="color: #3E2723;">${item.name}</strong><br>
                                <span style="color: #5D4037; font-size: 14px;">Quantity: ${item.quantity}</span>
                              </td>
                              <td align="right" style="padding: 15px 0;">
                                <strong style="color: #8B7355;">KSH ${(item.price * item.quantity).toLocaleString()}</strong>
                              </td>
                            </tr>
                          `).join('')}
                          
                          <!-- Total -->
                          <tr>
                            <td style="padding: 20px 0 0 0;">
                              <strong style="color: #3E2723; font-size: 18px;">Total</strong>
                            </td>
                            <td align="right" style="padding: 20px 0 0 0;">
                              <strong style="color: #8B7355; font-size: 20px;">KSH ${total.toLocaleString()}</strong>
                            </td>
                          </tr>
                        </table>

                        <!-- Track Order Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/orders" 
                                 style="display: inline-block; padding: 14px 32px; background-color: #8B7355; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                Track Your Order
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 30px 0 0 0; color: #5D4037; font-size: 14px; line-height: 1.5;">
                          If you have any questions, please don't hesitate to contact us.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: #FAF8F3; border-radius: 0 0 8px 8px; text-align: center;">
                        <p style="margin: 0; color: #5D4037; font-size: 14px;">
                          © ${new Date().getFullYear()} Reyah Collective. All rights reserved.
                        </p>
                        <p style="margin: 10px 0 0 0; color: #8B7355; font-size: 12px;">
                          Authentic Handmade Kenyan Crafts
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

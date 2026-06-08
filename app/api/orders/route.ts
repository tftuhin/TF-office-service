import { NextResponse } from 'next/server';

// Store orders in memory (for demo - use database in production)
let orders: any[] = [];
let orderCounter = 1;

export async function POST(request: Request) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Basic token validation
    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { items, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Create order object
    const orderId = orderCounter++;
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const order = {
      id: orderId,
      status: 'pending',
      notes: notes || 'Order placed from extension',
      total,
      items,
      created_at: new Date().toISOString()
    };

    orders.push(order);

    return NextResponse.json({
      success: true,
      orderId: orderId,
      message: 'Order placed successfully!'
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({
      error: 'Failed to place order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Basic token validation
    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Return all orders (in production, filter by user)
    return NextResponse.json({
      orders: orders,
      total: orders.length
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({
      error: 'Failed to load orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

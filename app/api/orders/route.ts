import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    try {
      const supabase = await createClient();

      // Get current user from session
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }

      // Calculate total
      const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error('Order creation error:', orderError);
        throw new Error('Failed to create order');
      }

      // Add order items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        item_id: item.menu_item_id,
        unit_price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw new Error('Failed to add items to order');
      }

      console.log('Order created successfully:', order.id);

      return NextResponse.json({
        success: true,
        orderId: order.id,
        message: 'Order placed successfully!'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        error: 'Failed to save order to database',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
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

    try {
      const supabase = await createClient();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }

      // Get user's orders from database
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          placed_at,
          order_items(
            quantity,
            unit_price,
            item:items(name)
          )
        `)
        .eq('user_id', user.id)
        .order('placed_at', { ascending: false });

      if (error) {
        console.error('Orders query error:', error);
        throw error;
      }

      return NextResponse.json({
        orders: orders || [],
        total: (orders || []).length
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        orders: [],
        total: 0
      });
    }
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({
      error: 'Failed to load orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

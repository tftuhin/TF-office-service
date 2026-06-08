import { NextResponse } from 'next/server';

// Mock menu items for now - replace with database query when needed
const MOCK_MENU_ITEMS = [
  { id: 1, name: 'Biryani', price: 250, category: 'Rice', description: 'Fragrant rice dish' },
  { id: 2, name: 'Chicken Curry', price: 180, category: 'Curry', description: 'Spiced chicken' },
  { id: 3, name: 'Dal Fry', price: 120, category: 'Lentils', description: 'Lentil curry' },
  { id: 4, name: 'Naan', price: 60, category: 'Bread', description: 'Tandoori bread' },
  { id: 5, name: 'Raita', price: 50, category: 'Sides', description: 'Yogurt side' },
  { id: 6, name: 'Samosa', price: 40, category: 'Appetizer', description: 'Fried pastry' },
  { id: 7, name: 'Chai', price: 30, category: 'Beverage', description: 'Tea' },
  { id: 8, name: 'Lassi', price: 50, category: 'Beverage', description: 'Yogurt drink' },
];

export async function GET(request: Request) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Basic token validation - check if token exists and is not empty
    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // For now, return mock menu items
    // TODO: Replace with actual database query when Supabase is fully configured
    return NextResponse.json({
      items: MOCK_MENU_ITEMS,
      total: MOCK_MENU_ITEMS.length
    });

    // Uncomment below when ready to use Supabase:
    /*
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('id, name, description, price, category')
      .eq('active', true)
      .order('category, name');

    if (error) {
      console.error('Menu query error:', error);
      return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 });
    }

    return NextResponse.json({
      items: menuItems || [],
      total: menuItems?.length || 0
    });
    */
  } catch (error) {
    console.error('Menu API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

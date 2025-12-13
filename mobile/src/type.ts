export type Product ={
    _id: string;
    title: string;
    description: string;
    price: number;
    images?: string [];
    category?: string;
    stock?: number;
    avg_rating: number;
    rating_coun?: number;
}

export type CartItem ={
    product_id: string;
    quantity: number;
    price?: number;
    title?: string;
    images?: string [];
}

export type Order={
    _id: string;
    user_id: string;
    items: CartItem[];
    address?: string;
    totalprice: number;
    status?: string;
    create_at?: string;
}

export type User ={
    id: string;
    name?: string;
    email: string;
    role?: string;
    address?: string;
}
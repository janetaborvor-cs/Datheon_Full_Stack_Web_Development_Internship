
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const CATEGORIES = ["All", "Electronics", "Jewelry", "Clothing"];

const CATEGORY_MAP = {
  Electronics: ["electronics"],
  Jewelry: ["jewelery"],
  Clothing: ["men's clothing", "women's clothing"],
};

const money = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

function App() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shopluxe-cart")) || [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://fakestoreapi.com/products"
        );

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        if (active) {
          setProducts(data);
        }
      } catch {
        if (active) {
          setError(
            "We couldn't load the products. Please check your internet connection and try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("shopluxe-cart", JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = `${product.title} ${product.category}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        CATEGORY_MAP[category]?.includes(product.category);

      return matchesSearch && matchesCategory;
    });
  }, [products, category, search]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = subtotal * 0.1;
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 7.99;
  const total = subtotal + tax + shipping;

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity: 1,
        },
      ];
    });

    setNotice("Added to your bag!");
    setTimeout(() => setNotice(""), 2200);
  }

  function updateQuantity(id, change) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function placeOrder(event) {
    event.preventDefault();

    if (cart.length === 0) return;

    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    setOrderPlaced(true);
  }

  function closeOrderMessage() {
    setOrderPlaced(false);
  }

  return (
    <div className="shop">
      <div className="announcement">
        A little something special for your everyday ✨
      </div>

      <header className="navbar">
        <a className="brand" href="#home" aria-label="ShopLuxe home">
          shop<span>luxe</span><i>.</i>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#products">Shop</a>
          <a href="#about">Our story</a>
        </nav>

        <button
          className="cart-button"
          onClick={() => setCartOpen(true)}
          aria-label={`Open shopping bag, ${cartCount} items`}
        >
          <span className="bag-icon">♧</span>
          <span>My Bag</span>
          <span className="cart-count">{cartCount}</span>
        </button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <span className="eyebrow">YOUR NEXT FAVORITE THING</span>
            <h1>
              Find your
              <br />
              <em>everyday</em> lovely.
            </h1>
            <p>
              Thoughtful finds, little luxuries, and pieces that
              make every day feel a little more special.
            </p>
            <a className="primary-button" href="#products">
              Explore the collection <span>↗</span>
            </a>
            <div className="hero-note">
              <span>✳</span> Curated with love, just for you.
            </div>
          </div>

          <div className="hero-art" aria-label="Shopping collection illustration">
            <div className="art-circle"></div>
            <div className="art-card art-card-one">
              <span>THE LITTLE</span>
              <strong>Things</strong>
              <span>THAT MATTER</span>
              <div className="art-flower">✿</div>
            </div>
            <div className="art-card art-card-two">
              <span>CURATED FINDS</span>
              <strong>For you ♡</strong>
            </div>
            <span className="sparkle sparkle-one">✦</span>
            <span className="sparkle sparkle-two">✳</span>
            <span className="sparkle sparkle-three">✧</span>
          </div>
        </section>

        <section className="benefits" aria-label="Store benefits">
          <div><span>♡</span> Curated with care</div>
          <div><span>✧</span> Lovely finds, fair prices</div>
          <div><span>↗</span> Easy, simple shopping</div>
        </section>

        <section className="catalog" id="products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE GOOD STUFF</span>
              <h2>A collection to <em>love.</em></h2>
              <p>Little discoveries, waiting to be yours.</p>
            </div>
            <div className="product-count">
              {loading ? "Finding your favorites..." : `${filteredProducts.length} products`}
            </div>
          </div>

          <div className="catalog-controls">
            <div className="filters" aria-label="Product categories">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  className={`filter-button ${category === item ? "active" : ""}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Find something lovely..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search products"
              />
            </label>
          </div>

          {loading && (
            <div className="message-state">
              <div className="loader"></div>
              <p>Gathering your lovely finds...</p>
            </div>
          )}

          {error && (
            <div className="message-state error-state">
              <p>{error}</p>
              <button
                className="primary-button"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="message-state">
              <span className="empty-icon">♡</span>
              <h3>No finds just yet</h3>
              <p>Try another search or choose a different category.</p>
              <button
                className="filter-button active"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Show all products
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image-wrap">
                    <span className="product-badge">
                      {product.rating?.rate >= 4.5 ? "LOVED" : "CURATED"}
                    </span>
                    <button
                      className="quick-add"
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.title} to bag`}
                      title="Add to bag"
                    >
                      +
                    </button>
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                    />
                  </div>

                  <div className="product-details">
                    <span className="product-category">
                      {product.category}
                    </span>
                    <h3 title={product.title}>{product.title}</h3>
                    <div className="product-bottom">
                      <strong>{money(product.price)}</strong>
                      <span className="rating">
                        ★ {product.rating?.rate ?? "—"}
                        <small> ({product.rating?.count ?? 0})</small>
                      </span>
                    </div>
                    <button
                      className="add-button"
                      onClick={() => addToCart(product)}
                    >
                      Add to bag <span>+</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="story" id="about">
  <div className="story-content">
    <span className="story-flower" aria-hidden="true">✿</span>

    <span className="eyebrow">THE STORY BEHIND SHOPLUXE</span>

    <h2>
      Little things.
      <br />
      <em>Lovely discoveries.</em>
    </h2>

    <p className="story-intro">
      Shopping should feel simple, inspiring, and a little special.
    </p>

    <p>
      ShopLuxe brings together everyday essentials, stylish accessories,
      fashion favorites, and thoughtful finds in one convenient place.
      We make it easy to explore new favorites, discover something
      different, and enjoy a smoother shopping experience.
    </p>

    <a className="primary-button" href="#products">
      Discover your favorites <span>↗</span>
    </a>

    <div className="story-values">
      <div>
        <span>♡</span>
        <strong>Thoughtful finds</strong>
        <small>A collection worth exploring.</small>
      </div>

      <div>
        <span>✧</span>
        <strong>Simple shopping</strong>
        <small>Easy browsing, all in one place.</small>
      </div>

      <div>
        <span>✿</span>
        <strong>Everyday style</strong>
        <small>Little touches that feel special.</small>
      </div>
    </div>
  </div>
</section>
      </main>

      <footer className="footer">
        <a className="brand" href="#home">shop<span>luxe</span><i>.</i></a>
        <p>A little lovely goes a long way.</p>
        <span>Made with ♡ for everyday living.</span>
      </footer>

      {notice && <div className="toast" role="status">{notice}</div>}

      {cartOpen && (
        <div
          className="drawer-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCartOpen(false);
          }}
        >
          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
          >
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">YOUR LITTLE FINDS</span>
                <h2>My bag <span>({cartCount})</span></h2>
              </div>
              <button
                className="close-button"
                onClick={() => setCartOpen(false)}
                aria-label="Close shopping bag"
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <span>♡</span>
                <h3>Your bag is waiting</h3>
                <p>Let's find something lovely for you.</p>
                <button
                  className="primary-button"
                  onClick={() => setCartOpen(false)}
                >
                  Explore products
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-image">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="cart-item-info">
                        <h3>{item.title}</h3>
                        <strong>{money(item.price)}</strong>
                        <div className="quantity-row">
                          <div className="quantity-control">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              aria-label={`Decrease ${item.title} quantity`}
                            >
                              −
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              aria-label={`Increase ${item.title} quantity`}
                            >
                              +
                            </button>
                          </div>
                          <button
                            className="remove-button"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                  <div><span>Estimated tax (10%)</span><strong>{money(tax)}</strong></div>
                  <div>
                    <span>Shipping</span>
                    <strong>{shipping === 0 ? "FREE" : money(shipping)}</strong>
                  </div>
                  {subtotal > 0 && subtotal < 100 && (
                    <p className="shipping-note">
                      Add {money(100 - subtotal)} more for free shipping.
                    </p>
                  )}
                  <div className="total-row"><span>Total</span><strong>{money(total)}</strong></div>
                  <button
                    className="checkout-button"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    Continue to checkout <span>↗</span>
                  </button>
                  <p className="secure-note">♡ A lovely choice, every time.</p>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="modal-backdrop">
          <section
            className="checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            <button
              className="close-button modal-close"
              onClick={() => setCheckoutOpen(false)}
              aria-label="Close checkout"
            >
              ×
            </button>
            <span className="eyebrow">ALMOST YOURS</span>
            <h2 id="checkout-title">One last little step.</h2>
            <p>
              This is a demo checkout. No payment will be taken.
            </p>
            <div className="modal-total">
              <span>Order total</span>
              <strong>{money(total)}</strong>
            </div>
            <form onSubmit={placeOrder}>
              <label>
                Your name
                <input name="name" required placeholder="Enter your name" />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </label>
              <button className="checkout-button" type="submit">
                Place demo order ♡
              </button>
            </form>
          </section>
        </div>
      )}

      {orderPlaced && (
        <div className="modal-backdrop">
          <section className="checkout-modal success-modal" role="dialog" aria-modal="true">
            <span className="success-heart">♡</span>
            <span className="eyebrow">ORDER CONFIRMED</span>
            <h2>Something lovely is on its way!</h2>
            <p>
              Your demo order was placed successfully. No payment was processed.
            </p>
            <button className="primary-button" onClick={closeOrderMessage}>
              Back to shopping
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;

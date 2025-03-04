import { useEffect, useState } from 'react';
import './App.css';

interface Product {
    name: string;
    price: number;
    quantity: number;
    summary: string;
}
interface Column {
    label: string;
    value: string;
}

function App() {
    const [products, setProducts] = useState<Product[]>();
    const [sortParameter, setSortParameter] = useState<string>('name');

    const columns: Column[] = [
        { label: "Name", value: "name" },
        { label: "Price", value: "price" },
        { label: "Quantity", value: "quantity" },
    ]

    useEffect(() => {
        const populateInventoryData = async () => {
            try {
                const response = await fetch(`Product?sortParam=${encodeURIComponent(sortParameter)}`);
                const data = await response.json();
                setProducts(data);
            } catch (e) {
                console.log("Error fetching products or backend service not yet available", e);
            }
        };

        populateInventoryData();
    }, [sortParameter]); 

    const formatPrice = (price: number) => {
        return `US$ ${price.toFixed(2)}`
    }

    const contents = products === undefined
        ? <p><em>Loading products... Please refresh once the ASP.NET backend has started!</em></p>

        : <div>
            <table className="table table-striped" aria-labelledby="tableLabel">
                <caption>Top 5 products by <strong>{sortParameter}</strong> in ascending order.</caption>
                <thead>
                    <tr>
                        {
                            columns.map(col => <th key={col.value} onClick={() => setSortParameter(col.value)}>
                                {col.label}
                                {sortParameter === col.value && <img src="https://www.svgrepo.com/show/93813/up-arrow.svg" className="sort-icon" />}
                            </th>)
                        }
                       
                    </tr>
                </thead>
                <tbody>
                    {products.map(product =>
                        <tr className={product.quantity > 3 ? 'high-qty-row' : ''} key={product.name}>
                            <td>{product.name}</td>
                            <td>{formatPrice(product.price)}</td>
                            <td>{product.quantity}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="highlight-legend-container">
                <div className="highlight-legend"></div> <p>Quantity greater than 3 items.</p>
            </div>
        </div>;
  

    return (
        <div className="container">
            <h1 id="tableLabel">Product Inventory</h1>
            {contents}
        </div>
    );
}

export default App;

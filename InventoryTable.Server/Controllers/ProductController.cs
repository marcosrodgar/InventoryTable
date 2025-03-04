using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace InventoryTable.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ILogger<ProductController> _logger;
        private readonly IMemoryCache _cache;
        private readonly IWebHostEnvironment _env;
        private const string CacheKey = "ProductList";

        public ProductController(ILogger<ProductController> logger, IMemoryCache cache, IWebHostEnvironment env)
        {
            _logger = logger;
            _cache = cache;
            _env = env;
        }

        [HttpGet]
        public IEnumerable<Product> Get([FromQuery] string sortParam = "price")
        {
            var products = _cache.GetOrCreate(CacheKey, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
                return LoadProductsFromXml();
            });

            if (products == null)
                return Enumerable.Empty<Product>();
        

            return sortParam.ToLower() switch
            {
                "price" => products.OrderBy(p => p.Price).Take(5),
                "quantity" => products.OrderBy(p => p.Quantity).Take(5),
                _ => products.OrderBy(p => p.Name).Take(5)
            };
        }

        private List<Product> LoadProductsFromXml()
        {
            var filePath = Path.Combine(_env.WebRootPath, "products.xml");

            if (!System.IO.File.Exists(filePath))
            {
                _logger.LogError($"File not found: {filePath}");
                return new List<Product>();
            }

            var xml = System.IO.File.ReadAllText(filePath);
            var xDoc = XDocument.Parse(xml);
            return xDoc.Descendants("product")
                .Select(p => new Product
                {
                    Name = (string)p.Attribute("name"),
                    Price = (decimal)p.Attribute("price"),
                    Quantity = (int)p.Attribute("qty")
                })
                .ToList();
        }
    }

    
}

import { useState, useEffect } from 'react';

type GraphNode = {
    productId: string;
    x: number;
    y: number;
    productName: string;
    productCode: string;
    productSector: {
        productId: string;
    };
}

type Product = {
  productId: string;
  [key: string]: unknown;
  productName: string;
  productCode: string;
  productSector: {
    productId: string;
  };
};
type Viewport = { width: number; height: number; padding?: number }

export function filterNodes(
  nodes: GraphNode[]): GraphNode[] {
  return (
    nodes.filter((n) => n.x !== null && n.y !== null)
      .map((n) => ({
        ...n,
        x: n.x as number,
        y: n.y as number,
        productId: n.productId as string
      }))
  )
}

/**
 * Combines filtered nodes with product data using productId as the key.
 * The result includes all fields from GraphNode.
 * @param nodes Result of filterNodes()
 * @param productHs92 Array of product data
 * @returns Array of merged GraphNode objects
 */
export function combineNodesWithProducts(
  nodes: GraphNode[],
  productHs92: Product[]
): GraphNode[] {
  const productMap = new Map(productHs92.map(p => [p.productId, p]));
  return nodes.map(node => {
    const product = productMap.get(node.productId as Product['productId']);
    // Ensure all GraphNode fields are present and not overwritten by product
    return {
      ...product,
      ...node,
      productId: node.productId,
      x: node.x,
      y: node.y,
      productName: product ? product.productName : node.productName,
      productCode: product ? product.productCode : node.productCode,
      productSector: product ? product.productSector : node.productSector,
    };
  });
}

export function scaleNodesToViewport(
  nodes: GraphNode[],
  viewport: Viewport
): GraphNode[] {
  const padding = viewport.padding ?? 20

  const xs = nodes.map(n => n.x)
  const ys = nodes.map(n => n.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const dataWidth = maxX - minX || 1
  const dataHeight = maxY - minY || 1

  const scaleX = (viewport.width - 2 * padding) / dataWidth
  const scaleY = (viewport.height - 2 * padding) / dataHeight
  const scale = Math.min(scaleX, scaleY)

  return nodes.map(n => ({
    productId: n.productId,
    x: (n.x - minX) * scale + padding,
    y: (n.y - minY) * scale + padding,
    productName: n.productName,
    productCode: n.productCode,
    productSector: n.productSector,
  }))
}

export function useViewport() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
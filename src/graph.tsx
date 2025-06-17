import type { EChartsOption } from 'echarts'
import { nodes, edges } from './assets/nodes_edges.json'
import { productHs92 } from './assets/metadata.json'
import { useViewport, scaleNodesToViewport, combineNodesWithProducts, filterNodes } from './utils'

interface GraphNode {
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

type Edge = { source: string; target: string }

const hs92ColorsMap = new Map([
    ['product-HS92-1', 'rgb(125, 218, 161)'],
    ['product-HS92-2', '#F5CF23'],
    ['product-HS92-3', 'rgb(218, 180, 125)'],
    ['product-HS92-4', 'rgb(187, 150, 138)'],
    ['product-HS92-5', 'rgb(217, 123, 123)'],
    ['product-HS92-6', 'rgb(197, 123, 217)'],
    ['product-HS92-7', 'rgb(141, 123, 216)'],
    ['product-HS92-8', 'rgb(123, 162, 217)'],
    ['product-HS92-9', 'rgb(125, 218, 218)'],
    ['product-HS92-10', '#2a607c'],
    ['product-HS92-14', 'rgb(178, 61, 109)'],
]);



export function ProductSpaceGraphOption(): EChartsOption {

    const links: Edge[] = edges;
    console.log('Links:', links);
    const { width, height } = useViewport();
    const filteredNodes = filterNodes(nodes as GraphNode[]);
    const productNodes = combineNodesWithProducts(filteredNodes, productHs92 as Product[]);
    const scaledNodes = scaleNodesToViewport(
        (productNodes as GraphNode[]),
        { width, height }
    );
    console.log('Filtered Nodes:', filteredNodes);
    console.log('Product Nodes:', productNodes);
    console.log('Scaled Nodes:', scaledNodes);

  return {
    title: {
      text: 'Product Space',
      subtext: 'Default layout',
      top: 'bottom',
      left: 'right'
    },
    tooltip: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
            const node = params.data as GraphNode | undefined;
            if (!node) return '';
            return `
                <strong>${node.productName}</strong>
                (${node.productCode})
            `;
        }
    },
    legend: [
      {
        // selectedMode: 'single',
        data: Array.from(hs92ColorsMap.keys()),
      }
    ],
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        name: 'Product Space',
        type: 'graph',
        symbolSize: 4,
        legendHoverLink: false,
        layout: 'none',
        data: (scaledNodes as GraphNode[]).map((node) => ({
          ...node,
          productId: node.productId,
          x: node.x,
          y: node.y,
          productName: node.productName,
          productCode: node.productCode,
          productSector: { productId: node.productSector.productId as GraphNode['productSector']['productId'] },
        })),
        edges: links.map((edge) => ({
          source: edge.source,
          target: edge.target,
            lineStyle: {
                color: '#ccc',
                width: 1
            }
        })),
        categories: scaledNodes.map((item) => ({
          name: item.productSector.productId as GraphNode['productSector']['productId']
        })),
        itemStyle: {
            color: (params) => {
             // params.data refers to the node data object
             if (params.data) {
                const datum: GraphNode = params.data as GraphNode;
               return hs92ColorsMap.get(datum.productSector?.productId) ?? '#ccc';
             }
             else {
               console.warn('Node data is missing productSector or productId:', params.data);
             return '#ccc'; // Fallback color if params.data is null/undefined
             }
          }
        },
        roam: true,
        label: {
          position: 'right',
          formatter: '{b}'
        },
        lineStyle: {
          color: 'source',
          curveness: 0
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4
          }
        },
        blur: {itemStyle: { opacity: 0.35 }},
      }
    ]
  };
}
import * as d3 from 'd3';
import { D3Node, D3Link, Concept } from '../types/types';
import { Ref } from 'vue';
import { useQueryStore } from '@/stores/query';

export function useForceGraph() {

    // Composable responsible for generating Force Graphs
    const DEFAULT_CONCEPT_NODE_COLOR = '3B82F6';
    const DEFAULT_CONCEPT_NODE_SIZE = 8;


    const queryStore = useQueryStore();

    /**
     * Creates a Force Graph visualisation using d3.js based on the given metadata
     * @param nodes array of nodes
     * @param links array of links between nodes
     * @param conceptForLookup reference to the current concept in lookup mode
     * @returns d3 force simulation object
     */
    const createForceGraphRepresentation = (nodes: D3Node[], links: D3Link[], conceptForLookup: Ref<Concept | any>): d3.Simulation<d3.SimulationNodeDatum, undefined> => {
      const svg = d3.select('.svg-container').style('width', '100%').style('height', '100%');
      
      const svgElement: HTMLElement = document.querySelector('.svg-container')!;
      const svgElementWidth = svgElement.clientWidth;
      const svgElementHeight = svgElement.clientHeight;
      
      const simulation = d3.forceSimulation(<any>nodes)
      // Apply a 'link' force in order to attract the related nodes
      .force('link', d3.forceLink(links).id((d: any) => d.index))
      // Apply a 'charge' force in order to space out the nodes
      .force('charge', d3.forceManyBody().strength(-30))
      // Apply a 'collide' detection force in order to keep the nodes not overlapping
      .force('collision', d3.forceCollide().radius(10))
      // Apply a 'center' force in order to render the nodes around the center of the svg container 
      .force('center', d3.forceCenter(svgElementWidth / 2, svgElementHeight / 2));
    
      queryStore.link = svg
        .selectAll<SVGLineElement, any> ('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke-width', 1)
        .style('stroke', 'black');
    
      queryStore.node = svg
        .selectAll<SVGCircleElement, any>('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', queryStore.conceptNodeSize)
        .attr('fill', `#${queryStore.conceptNodeColor}`)
        .attr('stroke', `#${queryStore.conceptNodeColor}`)
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .call(d3.drag<SVGCircleElement, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));
    
      simulation.on('tick', () => {
        queryStore.link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
    
        queryStore.node
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);
      });
    
    
      function findChildren(currentNode: any, links: any[]): any[] {
        const linksWithCurrentNodeAsSource = links.filter((link: any) => link.source.index === currentNode.index);
        const childNodes = linksWithCurrentNodeAsSource.map((link: any) => nodes[link.target.index]);
    
        const children = childNodes.flatMap((node: any) => findChildren(node, links));
    
        return [ ... childNodes, ... children ];
      };
    
    
      function dragstarted(event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) {
        if (!event.active) {
          simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      }
    
      function dragged(event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) {
        d.fx = event.x;
        d.fy = event.y;
        d3.select(this).style('cursor', 'grabbing');
      }
    
      function dragended(event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) {
        if (!event.active) {
          simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      }
    
      function mouseover(_: MouseEvent, d: any) {
        const nodeSize = d3.select(this).attr('r');
        d3.select(this).attr('cursor', 'grab').attr('r', parseInt(nodeSize) + 2);
    
        const childNodes = findChildren(d, links);
        queryStore.node.filter(n => childNodes.includes(n)).attr('fill', '#ffcc00');
    
        conceptForLookup.value = <any>{ conceptName: d.conceptName, conceptType: d.conceptType, childrenCount: childNodes.length };
      }
    
      function mouseout(_: MouseEvent, d: any) {
        conceptForLookup.value = null;
    
        const childNodes = findChildren(d, links);
    
        const oldNodeSize = d3.select(this).attr('r');
        d3.select(this).attr('r', parseInt(oldNodeSize) - 2);
        queryStore.node.filter(n => childNodes.includes(n)).attr('fill', `#${queryStore.conceptNodeColor}`);
      }
      
      return simulation;
    };


    /**
     * Updates the size of the concept nodes in the Force Graph visualization
     * @param size new size of the nodes
     * @param simulation reference to the current force simulation
     */
    const updateConceptNodeSize = (size: number): void => {
      queryStore.conceptNodeSize = size;

      const svg = d3.select('.svg-container');
      svg.selectAll<SVGCircleElement, any>('circle').attr('r', size);
    };

    
    /**
     * Updates the color of the concept nodes in the Force Graph visualisation
     * @param color new color of the nodes
     * @param simulation reference to the current force simulation
     */
    const updateConceptNodeColor = (color: string): void => {
      queryStore.conceptNodeColor = color;

      const svg = d3.select('.svg-container');
      svg.selectAll<SVGCircleElement, any>('circle').attr('fill', `#${color}`).attr('stroke', `#${color}`);
    };

    
    const resetForceConfigurationsToDefault = (): void => {
      updateConceptNodeColor(DEFAULT_CONCEPT_NODE_COLOR);
      updateConceptNodeSize(DEFAULT_CONCEPT_NODE_SIZE);
    };

    return {
        createForceGraphRepresentation,
        updateConceptNodeSize,
        updateConceptNodeColor,
        resetForceConfigurationsToDefault,
        DEFAULT_CONCEPT_NODE_COLOR,
        DEFAULT_CONCEPT_NODE_SIZE,
    };
}
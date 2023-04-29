import * as d3 from 'd3';
import { D3Node, D3Link, Concept } from '../types/types';
import { Ref } from 'vue';

export function useForceGraph() {

    // Composable responsible for generating Force Graphs

    /**
     * Creates a Force Graph visualisation using d3.js based on the given metadata
     * @param nodes array of nodes
     * @param links array of links between nodes
     * @param conceptForLookup reference to the current concept in lookup mode
     * @returns d3 force simulation object
     */
    const createForceGraphRepresentation = (nodes: D3Node[], links: D3Link[], conceptForLookup: Ref<Concept | any>): d3.Simulation<d3.SimulationNodeDatum, undefined> => {
    
        const width = window.innerWidth - 21 * 16;
        const height = window.innerHeight;
        const svg = d3.select('.svg-container').style('width', width).style('height', height);
        
        const simulation = d3.forceSimulation(<any>nodes)
        // Apply a 'link' force in order to attract the related nodes
        .force('link', d3.forceLink(links).id((d: any) => d.index))
        // Apply a 'charge' force in order to space out the nodes
        .force('charge', d3.forceManyBody().strength(-30))
        // Apply a 'collide' detection force in order to keep the nodes not overlapping
        .force('collision', d3.forceCollide().radius(10))
        // Apply a 'center' force in order to render the nodes around the center of the svg container 
        .force('center', d3.forceCenter(width / 2, height / 2 - 168))
    
      const link = svg
        .selectAll<SVGLineElement, any> ('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke-width', 1)
        .style('stroke', 'black');
    
      const node = svg
        .selectAll<SVGCircleElement, any>('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', 8)
        .attr('fill', '#3B82F6')
        .attr('stroke', '#3B82F6')
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .call(d3.drag<SVGCircleElement, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));
    
      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
    
        node
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
        node.filter(n => childNodes.includes(n)).attr('fill', '#ffcc00');
    
        conceptForLookup.value = <any>{ conceptName: d.conceptName, conceptType: d.conceptType, childrenCount: childNodes.length };
      }
    
      function mouseout(_: MouseEvent, d: any) {
        conceptForLookup.value = null;
    
        const childNodes = findChildren(d, links);
    
        const oldNodeSize = d3.select(this).attr('r');
        d3.select(this).attr('r', parseInt(oldNodeSize) - 2);
        node.filter(n => childNodes.includes(n)).attr('fill',' #3B82F6');
      }
      
      return simulation;
    };


    /**
     * Updates the Force Graph visualisation
     * @param size new size of the nodes
     * @param simulation reference to the current force simulation
     */
    const updateConceptNodeSize = (size: number, simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>): void => {
        const svg = d3.select('.svg-container');
        svg.selectAll<SVGCircleElement, any>('circle').attr('r', size);
      
        simulation.restart();
      };

    return {
        createForceGraphRepresentation,
        updateConceptNodeSize
    };
}
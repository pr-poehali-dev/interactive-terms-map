import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Term {
  id: number;
  term: string;
  definition: string;
  category: string;
  normative_source: string;
  example: string;
  related_terms: number[];
  source_site: string;
  note: string;
}

interface Node extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  definition: string;
  fullData: Term;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: number | Node;
  target: number | Node;
}

const Map = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [tooltipFixed, setTooltipFixed] = useState(false);

  useEffect(() => {
    fetchTerms();
  }, []);

  useEffect(() => {
    if (terms.length > 0 && svgRef.current) {
      renderGraph();
    }
  }, [terms]);

  const fetchTerms = async () => {
    const response = await fetch('https://functions.poehali.dev/3cefa232-faf3-4f6c-8625-37099407afa2');
    const data = await response.json();
    setTerms(data);
  };

  const renderGraph = () => {
    if (!svgRef.current) return;

    const container = svgRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const nodes: Node[] = terms.map((term) => ({
      id: term.id,
      name: term.term,
      definition: term.definition,
      fullData: term,
    }));

    const links: Link[] = [];
    terms.forEach((term) => {
      if (term.related_terms) {
        term.related_terms.forEach((targetId) => {
          links.push({
            source: term.id,
            target: targetId,
          });
        });
      }
    });

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(d3.drag<any, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    const circles = node.append('circle')
      .attr('r', 30)
      .attr('fill', '#0EA5E9')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .style('filter', 'url(#glow)')
      .style('transition', 'all 0.3s ease');

    const labels = node.append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    node.on('mouseenter', function (event, d) {
      if (!tooltipFixed) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', 36)
          .attr('fill', '#0284c7');
      }
    });

    node.on('mouseleave', function (event, d) {
      if (!tooltipFixed) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', 30)
          .attr('fill', '#0EA5E9');
      }
    });

    node.on('click', function (event, d) {
      setSelectedTerm(d.fullData);
      setTooltipFixed(true);

      d3.selectAll('.nodes g circle')
        .transition()
        .duration(200)
        .attr('r', 30)
        .attr('fill', '#0EA5E9');

      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', 36)
        .attr('fill', '#0284c7');
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    });
  };

  const closeDetailsPanel = () => {
    setSelectedTerm(null);
    setTooltipFixed(false);

    if (svgRef.current) {
      d3.select(svgRef.current).selectAll('.nodes g circle')
        .transition()
        .duration(200)
        .attr('r', 30)
        .attr('fill', '#0EA5E9');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Карта связей терминов
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Визуализация взаимосвязей между терминами. Нажмите на термин для подробной информации
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[600px] relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Badge variant="secondary" className="gap-2">
                  <Icon name="Circle" size={12} fill="currentColor" />
                  Термины: {terms.length}
                </Badge>
              </div>
              <svg ref={svgRef} className="w-full h-full" />
            </Card>
          </div>

          <div className="lg:col-span-1">
            {selectedTerm ? (
              <Card className="h-[600px] overflow-y-auto animate-scale-in">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{selectedTerm.term}</CardTitle>
                      <Badge variant="outline">{selectedTerm.category}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeDetailsPanel}
                    >
                      <Icon name="X" size={18} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="BookOpen" size={16} />
                      Определение
                    </h4>
                    <CardDescription>{selectedTerm.definition}</CardDescription>
                  </div>

                  {selectedTerm.normative_source && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Icon name="FileText" size={16} />
                        Нормативный источник
                      </h4>
                      <CardDescription>{selectedTerm.normative_source}</CardDescription>
                    </div>
                  )}

                  {selectedTerm.example && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Icon name="Code" size={16} />
                        Пример
                      </h4>
                      <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
                        <code>{selectedTerm.example}</code>
                      </pre>
                    </div>
                  )}

                  {selectedTerm.source_site && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Icon name="Globe" size={16} />
                        Сайт-источник
                      </h4>
                      <a
                        href={`https://${selectedTerm.source_site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        {selectedTerm.source_site}
                      </a>
                    </div>
                  )}

                  {selectedTerm.note && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Icon name="Info" size={16} />
                        Примечание
                      </h4>
                      <CardDescription>{selectedTerm.note}</CardDescription>
                    </div>
                  )}

                  {selectedTerm.related_terms.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Icon name="Link" size={16} />
                        Связанные термины
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTerm.related_terms.map((relatedId) => {
                          const relatedTerm = terms.find((t) => t.id === relatedId);
                          return relatedTerm ? (
                            <Badge
                              key={relatedId}
                              variant="secondary"
                              className="cursor-pointer hover-scale"
                              onClick={() => {
                                setSelectedTerm(relatedTerm);
                              }}
                            >
                              {relatedTerm.term}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <Icon name="MousePointerClick" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Нажмите на термин на карте, чтобы увидеть подробную информацию
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;

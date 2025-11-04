import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

const Compare = () => {
  const [searchParams] = useSearchParams();
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTerms();
  }, []);

  useEffect(() => {
    if (terms.length > 0) {
      const ids = searchParams.get('ids')?.split(',').map(Number) || [];
      const termsToCompare = terms.filter((term) => ids.includes(term.id));
      setSelectedTerms(termsToCompare);
      setIsLoading(false);
    }
  }, [terms, searchParams]);

  const fetchTerms = async () => {
    const response = await fetch('https://functions.poehali.dev/3cefa232-faf3-4f6c-8625-37099407afa2');
    const data = await response.json();
    setTerms(data);
  };

  const exportToExcel = () => {
    const headers = ['Характеристика', ...selectedTerms.map(t => t.term)];
    const rows = [
      ['Определение', ...selectedTerms.map(t => `"${t.definition}"`)],
      ['Категория', ...selectedTerms.map(t => `"${t.category}"`)],
      ['Нормативный источник', ...selectedTerms.map(t => `"${t.normative_source || '-'}"`)],
      ['Пример', ...selectedTerms.map(t => `"${t.example || '-'}"`)],
      ['Сайт-источник', ...selectedTerms.map(t => `"${t.source_site || '-'}"`)],
      ['Примечание', ...selectedTerms.map(t => `"${t.note || '-'}"`)],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'сравнение_терминов.csv';
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка терминов...</p>
        </div>
      </div>
    );
  }

  if (selectedTerms.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Термины не выбраны</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Icon name="AlertCircle" size={64} className="mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Выберите термины для сравнения на главной странице
              </p>
              <Button asChild>
                <Link to="/">
                  <Icon name="Home" size={18} className="mr-2" />
                  На главную
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Сравнение терминов
            </h1>
            <p className="text-muted-foreground">
              Сравнение {selectedTerms.length} {selectedTerms.length === 1 ? 'термина' : selectedTerms.length < 5 ? 'терминов' : 'терминов'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToExcel} variant="outline" className="gap-2">
              <Icon name="Download" size={18} />
              Экспорт в Excel
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                <Icon name="ArrowLeft" size={18} className="mr-2" />
                Назад
              </Link>
            </Button>
          </div>
        </div>

        {selectedTerms.length <= 3 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedTerms.map((term) => (
              <Card key={term.id} className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="text-xl">{term.term}</CardTitle>
                  <Badge variant="outline" className="w-fit">{term.category}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <Icon name="BookOpen" size={14} />
                      Определение
                    </h4>
                    <p className="text-sm text-muted-foreground">{term.definition}</p>
                  </div>

                  {term.normative_source && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                        <Icon name="FileText" size={14} />
                        Нормативный источник
                      </h4>
                      <p className="text-sm text-muted-foreground">{term.normative_source}</p>
                    </div>
                  )}

                  {term.example && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                        <Icon name="Code" size={14} />
                        Пример
                      </h4>
                      <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
                        <code>{term.example}</code>
                      </pre>
                    </div>
                  )}

                  {term.source_site && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                        <Icon name="Globe" size={14} />
                        Сайт-источник
                      </h4>
                      <a
                        href={`https://${term.source_site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        {term.source_site}
                      </a>
                    </div>
                  )}

                  {term.note && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                        <Icon name="Info" size={14} />
                        Примечание
                      </h4>
                      <p className="text-sm text-muted-foreground">{term.note}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-x-auto animate-scale-in">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold w-48">Характеристика</TableHead>
                  {selectedTerms.map((term) => (
                    <TableHead key={term.id} className="font-bold min-w-64">
                      <div className="space-y-2">
                        <div>{term.term}</div>
                        <Badge variant="outline" className="w-fit">{term.category}</Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Определение</TableCell>
                  {selectedTerms.map((term) => (
                    <TableCell key={term.id} className="text-sm">
                      {term.definition}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Нормативный источник</TableCell>
                  {selectedTerms.map((term) => (
                    <TableCell key={term.id} className="text-sm">
                      {term.normative_source || '-'}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Пример</TableCell>
                  {selectedTerms.map((term) => (
                    <TableCell key={term.id}>
                      {term.example ? (
                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                          <code>{term.example}</code>
                        </pre>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Сайт-источник</TableCell>
                  {selectedTerms.map((term) => (
                    <TableCell key={term.id} className="text-sm">
                      {term.source_site ? (
                        <a
                          href={`https://${term.source_site}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {term.source_site}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Примечание</TableCell>
                  {selectedTerms.map((term) => (
                    <TableCell key={term.id} className="text-sm">
                      {term.note || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        )}

        {selectedTerms.length > 1 && (
          <Card className="mt-8 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Lightbulb" size={20} />
                Анализ сравнения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Общие характеристики:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {Array.from(new Set(selectedTerms.map(t => t.category))).length === 1 && (
                    <li>Все термины относятся к одной категории: <Badge variant="secondary" className="ml-2">{selectedTerms[0].category}</Badge></li>
                  )}
                  {Array.from(new Set(selectedTerms.map(t => t.normative_source))).length === 1 && selectedTerms[0].normative_source && (
                    <li>Все термины из одного нормативного источника: {selectedTerms[0].normative_source}</li>
                  )}
                  {Array.from(new Set(selectedTerms.map(t => t.category))).length > 1 && (
                    <li>Термины относятся к разным категориям: {Array.from(new Set(selectedTerms.map(t => t.category))).join(', ')}</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Связи между терминами:</h4>
                {selectedTerms.some(term => 
                  selectedTerms.some(otherTerm => 
                    term.id !== otherTerm.id && term.related_terms.includes(otherTerm.id)
                  )
                ) ? (
                  <div className="space-y-2">
                    {selectedTerms.map(term => {
                      const relatedInSelection = selectedTerms.filter(
                        otherTerm => term.id !== otherTerm.id && term.related_terms.includes(otherTerm.id)
                      );
                      if (relatedInSelection.length > 0) {
                        return (
                          <p key={term.id} className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">{term.term}</span> связан с:{' '}
                            {relatedInSelection.map(t => t.term).join(', ')}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Прямых связей между выбранными терминами не обнаружено</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Compare;

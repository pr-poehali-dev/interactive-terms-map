import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

const ALPHABET = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ'.split('');

const Home = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<Term[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);

  useEffect(() => {
    fetchTerms();
  }, []);

  useEffect(() => {
    filterTerms();
  }, [terms, searchQuery, selectedCategory, selectedLetter]);

  const fetchTerms = async () => {
    const response = await fetch('https://functions.poehali.dev/3cefa232-faf3-4f6c-8625-37099407afa2');
    const data = await response.json();
    setTerms(data);
    
    const uniqueCategories = Array.from(new Set(data.map((t: Term) => t.category)));
    setCategories(uniqueCategories as string[]);
  };

  const filterTerms = () => {
    let filtered = [...terms];

    if (searchQuery) {
      filtered = filtered.filter(
        (term) =>
          term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          term.definition.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((term) => term.category === selectedCategory);
    }

    if (selectedLetter) {
      filtered = filtered.filter((term) => term.term.toUpperCase().startsWith(selectedLetter));
    }

    setFilteredTerms(filtered);
  };

  const handleTermClick = (term: Term) => {
    setSelectedTerm(term);
    setIsDialogOpen(true);
  };

  const toggleComparisonSelection = (termId: number) => {
    setSelectedForComparison((prev) =>
      prev.includes(termId) ? prev.filter((id) => id !== termId) : [...prev, termId]
    );
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Термин', 'Определение', 'Категория', 'Нормативный источник', 'Пример', 'Сайт-источник', 'Примечание'].join(','),
      ...filteredTerms.map((term) =>
        [
          `"${term.term}"`,
          `"${term.definition}"`,
          `"${term.category}"`,
          `"${term.normative_source || ''}"`,
          `"${term.example || ''}"`,
          `"${term.source_site || ''}"`,
          `"${term.note || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'термины.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Интерактивная карта терминов
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Исследуйте взаимосвязи между терминами, фильтруйте по категориям и находите нужную информацию
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Icon name="Search" className="absolute left-3 top-3 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Поиск терминов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-64 h-12">
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {ALPHABET.map((letter) => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLetter(selectedLetter === letter ? '' : letter)}
                className="w-10 h-10 p-0 hover-scale"
              >
                {letter}
              </Button>
            ))}
            {selectedLetter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLetter('')}
                className="gap-1"
              >
                <Icon name="X" size={16} />
                Сбросить
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Найдено терминов: <span className="font-semibold text-foreground">{filteredTerms.length}</span>
          </p>
          {selectedForComparison.length > 0 && (
            <Badge variant="secondary" className="gap-2">
              <Icon name="GitCompare" size={16} />
              Выбрано для сравнения: {selectedForComparison.length}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredTerms.map((term, index) => (
            <Card
              key={term.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleTermClick(term)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{term.term}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComparisonSelection(term.id);
                    }}
                    className={selectedForComparison.includes(term.id) ? 'text-primary' : ''}
                  >
                    <Icon name="GitCompare" size={18} />
                  </Button>
                </div>
                <Badge variant="outline" className="w-fit">
                  {term.category}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">{term.definition}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button onClick={exportToExcel} size="lg" className="gap-2">
            <Icon name="Download" size={20} />
            Выгрузить в Excel
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedTerm && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedTerm.term}</DialogTitle>
                  <Badge variant="outline" className="w-fit">
                    {selectedTerm.category}
                  </Badge>
                </DialogHeader>
                <DialogDescription className="space-y-4 text-base">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Определение</h4>
                    <p>{selectedTerm.definition}</p>
                  </div>

                  {selectedTerm.normative_source && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Нормативный источник</h4>
                      <p>{selectedTerm.normative_source}</p>
                    </div>
                  )}

                  {selectedTerm.example && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Пример</h4>
                      <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-sm">
                        <code>{selectedTerm.example}</code>
                      </pre>
                    </div>
                  )}

                  {selectedTerm.source_site && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Сайт-источник</h4>
                      <a
                        href={`https://${selectedTerm.source_site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedTerm.source_site}
                      </a>
                    </div>
                  )}

                  {selectedTerm.note && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Примечание</h4>
                      <p>{selectedTerm.note}</p>
                    </div>
                  )}

                  {selectedTerm.related_terms.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Связанные термины</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTerm.related_terms.map((relatedId) => {
                          const relatedTerm = terms.find((t) => t.id === relatedId);
                          return relatedTerm ? (
                            <Badge
                              key={relatedId}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => handleTermClick(relatedTerm)}
                            >
                              {relatedTerm.term}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </DialogDescription>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Home;

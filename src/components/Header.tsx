import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover-scale">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <Icon name="BookOpen" size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg">Справочник терминов</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button
            variant={isActive('/') ? 'default' : 'ghost'}
            asChild
            className="gap-2"
          >
            <Link to="/">
              <Icon name="Home" size={18} />
              Главная
            </Link>
          </Button>
          
          <Button
            variant={isActive('/map') ? 'default' : 'ghost'}
            asChild
            className="gap-2"
          >
            <Link to="/map">
              <Icon name="Network" size={18} />
              Карта
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

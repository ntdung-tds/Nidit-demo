import { Route, Switch } from 'wouter';
import { PortalProvider } from './lib';
import { PortalLayout } from './Layout';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import { NewsPage, CategoryPage, ArticlePage } from './pages/News';
import { IntroPage, MandatePage, OrgPage, LeadersPage, ContactPage, StaticPageRoute } from './pages/About';
import { FieldsPage, FieldDetailPage, ProjectsPage, ProjectDetailPage, PublicationsPage } from './pages/Research';
import { DatasetsPage, DatasetDetailPage, ServicesPage, ServiceDetailPage } from './pages/Data';
import { DocumentsPage, DocumentDetailPage, LibraryPage, AlbumPage, SearchPage, SitemapPage, RssPage } from './pages/Docs';

export default function PublicApp() {
  return (
    <PortalProvider>
      <PortalLayout>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/tin-tuc" component={NewsPage} />
          <Route path="/tin-tuc/chuyen-muc/:slug" component={CategoryPage} />
          <Route path="/tin-tuc/:slug" component={ArticlePage} />
          <Route path="/gioi-thieu" component={IntroPage} />
          <Route path="/gioi-thieu/chuc-nang-nhiem-vu" component={MandatePage} />
          <Route path="/gioi-thieu/co-cau-to-chuc" component={OrgPage} />
          <Route path="/gioi-thieu/lanh-dao" component={LeadersPage} />
          <Route path="/lien-he" component={ContactPage} />
          <Route path="/trang/:slug" component={StaticPageRoute} />
          <Route path="/linh-vuc" component={FieldsPage} />
          <Route path="/linh-vuc/:slug" component={FieldDetailPage} />
          <Route path="/nghien-cuu" component={ProjectsPage} />
          <Route path="/nghien-cuu/:slug" component={ProjectDetailPage} />
          <Route path="/cong-bo-khoa-hoc" component={PublicationsPage} />
          <Route path="/du-lieu-ai" component={DatasetsPage} />
          <Route path="/du-lieu-ai/:slug" component={DatasetDetailPage} />
          <Route path="/danh-gia-kiem-dinh" component={ServicesPage} />
          <Route path="/danh-gia-kiem-dinh/:slug" component={ServiceDetailPage} />
          <Route path="/van-ban" component={DocumentsPage} />
          <Route path="/van-ban/:id" component={DocumentDetailPage} />
          <Route path="/thu-vien" component={LibraryPage} />
          <Route path="/thu-vien/:slug" component={AlbumPage} />
          <Route path="/tim-kiem" component={SearchPage} />
          <Route path="/so-do-trang" component={SitemapPage} />
          <Route path="/rss" component={RssPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </PortalLayout>
    </PortalProvider>
  );
}

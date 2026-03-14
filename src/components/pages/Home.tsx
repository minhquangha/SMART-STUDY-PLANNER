import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, LayoutDashboard, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* --- 1. Navigation --- */}
      <nav className="flex items-center justify-between px-8 py-4 border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">SmartStudy</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Đăng nhập</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Bắt đầu ngay</Link>
          </Button>
        </div>
      </nav>

      {/* --- 2. Hero Section --- */}
      <section className="container mx-auto px-6 py-24 text-center">
        <Badge variant="secondary" className="mb-4 py-1 px-4 text-sm font-medium">
          🚀 Phiên bản 1.0 đã sẵn sàng
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Học tập thông minh hơn, <br /> không phải chăm chỉ hơn.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Hệ thống quản lý lộ trình học tập tối ưu sử dụng MERN Stack.
          Lập kế hoạch, theo dõi tiến độ và chinh phục mục tiêu của bạn chỉ trong một nền tảng.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="h-12 px-8 text-lg" asChild>
            <Link to="/register">
              Bắt đầu miễn phí <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
            Xem bản Demo
          </Button>
        </div>

        {/* Mockup Dashboard Preview */}
        <div className="mt-16 border rounded-xl overflow-hidden shadow-2xl bg-muted/50 p-2 max-w-5xl mx-auto">
           <div className="rounded-lg bg-background border border-border/50 h-[400px] flex items-center justify-center text-muted-foreground">
              [ Dashboard Preview Image / Video ]
           </div>
        </div>
      </section>

      {/* --- 3. Features Section --- */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tính năng nổi bật</h2>
            <p className="text-muted-foreground">Mọi thứ bạn cần để duy trì kỷ luật học tập.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-10 h-10 text-yellow-500" />}
              title="Quản lý Task nhanh"
              description="Tạo và phân loại bài tập theo mức độ ưu tiên High/Medium/Low cực nhanh."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-10 h-10 text-green-500" />}
              title="Bảo mật tuyệt đối"
              description="Sử dụng xác thực JWT mạnh mẽ, bảo vệ dữ liệu cá nhân của bạn an toàn."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-10 h-10 text-blue-500" />}
              title="Theo dõi tiến độ"
              description="Trạng thái Todo, Doing, Done trực quan giúp bạn kiểm soát khối lượng công việc."
            />
          </div>
        </div>
      </section>

      {/* --- 4. Footer --- */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2024 SmartStudy Planner. Made with ❤️ for Students.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <Card className="hover:shadow-lg transition-shadow border-none bg-background">
    <CardHeader>
      <div className="mb-4">{icon}</div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

export default Home;
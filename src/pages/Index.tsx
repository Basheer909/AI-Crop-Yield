import { useState, useEffect } from "react";
import { User, signInAnonymously, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, where, orderBy, getDocs } from "firebase/firestore";
import { auth, db, APP_ID } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LogOut, History } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PredictionForm } from "@/components/PredictionForm";
import { PredictionResults } from "@/components/PredictionResults";
import { translations, Language } from "@/lib/translations";
import { 
  PredictionInput, 
  PredictionResult, 
  get_prediction_and_optimization 
} from "@/lib/predictionService";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const { toast } = useToast();
  const t = translations[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadHistory(currentUser.uid);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
        } catch (error: any) {
          toast({
            title: t.error,
            description: t.loginFailed,
            variant: "destructive",
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadHistory = async (userId: string) => {
    try {
      const historyRef = collection(db, `artifacts/${APP_ID}/users/${userId}/prediction_history`);
      const q = query(historyRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handlePrediction = async (inputData: PredictionInput) => {
    setIsLoading(true);
    try {
      const predictionResult = await get_prediction_and_optimization(inputData);
      setResult(predictionResult);

      if (user && predictionResult.status === 'success') {
        try {
          const historyRef = collection(db, `artifacts/${APP_ID}/users/${user.uid}/prediction_history`);
          await addDoc(historyRef, {
            ...inputData,
            ...predictionResult,
            timestamp: new Date().toISOString(),
          });
          loadHistory(user.uid);
          toast({
            title: t.success,
            description: predictionResult.message,
          });
        } catch (error) {
          toast({
            title: t.error,
            description: t.saveFailed,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.message || 'Prediction failed',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setResult(null);
      setHistory([]);
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <LanguageSelector 
            currentLanguage={language} 
            onLanguageChange={setLanguage} 
          />
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{t.userId}:</span> {user.uid.slice(0, 8)}...
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="border-border hover:bg-secondary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.logout}
              </Button>
            </div>
          )}
        </div>

        <Separator className="mb-8 bg-border" />

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Form */}
          <div>
            <PredictionForm 
              language={language}
              onSubmit={handlePrediction}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Results */}
          <div>
            <PredictionResults 
              language={language}
              result={result}
            />
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <Card className="shadow-medium border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <History className="h-5 w-5 text-muted-foreground" />
                {t.history}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.slice(0, 5).map((item, index) => (
                  <div 
                    key={item.id || index}
                    className="p-4 bg-secondary/50 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {item.crop} - {item.district}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.season} {item.year}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {item.current_yield?.toFixed(2)} {t.units}
                        </p>
                        {item.recommended_crop && (
                          <p className="text-xs text-accent">
                            +{item.estimated_gain} {t.units}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;

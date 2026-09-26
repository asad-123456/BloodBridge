import os
import re

file_path = r"c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# I will rewrite the entire fetching logic in BloodFeed to use a unified fetchRequests function with AbortController

new_bloodfeed_body = """
export function BloodFeed() {
  const { accessToken } = useAuth();
  const [requests, setRequests] = useState<BloodRequestOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [cooldownDays, setCooldownDays] = useState<number>(0);
  const [commitModalReq, setCommitModalReq] = useState<string | null>(null);
  const [commitUnits, setCommitUnits] = useState(1);
  const [commitEta, setCommitEta] = useState(2);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRequests = async (lat: number, lon: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/blood-requests/nearby/for-me?latitude=${lat}&longitude=${lon}&radius_km=50`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: abortControllerRef.current.signal
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setRequests(data);
      } else {
        toast.error("Failed to fetch nearby requests.");
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error(e);
        toast.error("Error fetching requests.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPos([latitude, longitude]);
        
        if (accessToken) {
          fetch(`${apiBaseUrl}/donors/me/stats`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
            .then(res => res.json())
            .then(stats => {
              if (stats.eligible_after) {
                const days = Math.ceil((new Date(stats.eligible_after).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                if (days > 0) setCooldownDays(days);
              }
            })
            .catch(console.error);
        }
        
        fetchRequests(latitude, longitude);
      },
      (error) => {
        setLoading(false);
      }
    );
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [accessToken]);
"""

content = re.sub(r'export function BloodFeed\(\) \{.*?(?=  return \()', new_bloodfeed_body.strip() + '\n\n', content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

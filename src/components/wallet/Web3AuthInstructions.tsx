
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Web3AuthInstructions = () => {
  return (
    <div className="mt-4 p-4 border rounded-md bg-gray-50">
      <Alert className="mb-4 border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-700" />
        <AlertTitle className="text-amber-700">Web3Auth Configuration Required</AlertTitle>
        <AlertDescription className="text-amber-700">
          To enable Web3Auth wallet functionality, you need to configure your Web3Auth Client ID.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="setup">
          <AccordionTrigger>How to setup Web3Auth</AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <p>Create an account at <a href="https://dashboard.web3auth.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Web3Auth Dashboard</a></p>
              </li>
              <li>
                <p>Create a new project</p>
              </li>
              <li>
                <p>Copy your Client ID from the project dashboard</p>
              </li>
              <li>
                <p>Open the file <code className="bg-gray-200 px-1 rounded">src/hooks/useWeb3Auth.tsx</code> in your codebase</p>
              </li>
              <li>
                <p>Replace the <code className="bg-gray-200 px-1 rounded">WEB3AUTH_CLIENT_ID</code> value with your Client ID</p>
              </li>
              <li>
                <p>Configure allowed domains in your Web3Auth dashboard (add your app's domain)</p>
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="network">
          <AccordionTrigger>Web3Auth Network Settings</AccordionTrigger>
          <AccordionContent>
            <p>The application is currently configured to use:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Network: <code className="bg-gray-200 px-1 rounded">sapphire_devnet</code></li>
              <li>Chain: <code className="bg-gray-200 px-1 rounded">Ethereum Mainnet (0x1)</code></li>
            </ul>
            <p className="mt-2">You can modify these settings in <code className="bg-gray-200 px-1 rounded">src/hooks/useWeb3Auth.tsx</code> if needed.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Web3AuthInstructions;

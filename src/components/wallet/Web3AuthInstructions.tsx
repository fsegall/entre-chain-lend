
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink, Copy, Check } from "lucide-react";
import { useWeb3Auth } from "@/hooks/useWeb3Auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Web3AuthInstructions = () => {
  const { configError, domainError } = useWeb3Auth();
  const [copied, setCopied] = useState(false);
  
  const copyDomain = () => {
    const text = window.location.origin;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="mt-4 p-6 border rounded-md bg-gray-50">
      <Alert className={`mb-6 ${domainError ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
        <AlertCircle className={`h-5 w-5 ${domainError ? 'text-red-700' : 'text-amber-700'}`} />
        <AlertTitle className={`text-lg ${domainError ? 'text-red-700' : 'text-amber-700'}`}>
          {domainError ? 'Domain Whitelisting Required' : 'Web3Auth Configuration Required'}
        </AlertTitle>
        <AlertDescription className={`text-base ${domainError ? 'text-red-700' : 'text-amber-700'}`}>
          {domainError 
            ? 'Your domain needs to be added to the allowed list in Web3Auth dashboard.'
            : 'To enable Web3Auth wallet functionality, you need to configure your Web3Auth Client ID.'}
        </AlertDescription>
      </Alert>

      {domainError && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded">
          <h3 className="font-bold text-red-800 mb-2">Current Domain Whitelist Error</h3>
          <p className="text-red-800 mb-4">
            The error you're seeing is because your current domain ({window.location.origin}) is not whitelisted in the Web3Auth project settings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button 
              variant="default" 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => window.open("https://dashboard.web3auth.io/", "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Go to Web3Auth Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="border-red-300 text-red-700"
              onClick={copyDomain}
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Domain Copied!" : "Copy Your Domain"}
            </Button>
          </div>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full" defaultValue={domainError ? "domain" : "setup"}>
        {domainError && (
          <AccordionItem value="domain" className="border-b">
            <AccordionTrigger className="text-lg font-medium">How to whitelist your domain</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed">
              <ol className="list-decimal pl-5 space-y-4">
                <li>
                  <p>Log in to your <a href="https://dashboard.web3auth.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Web3Auth Dashboard</a></p>
                </li>
                <li>
                  <p>Select your project or create a new one</p>
                </li>
                <li>
                  <p>Go to the "Whitelist Domains" section in your project settings</p>
                </li>
                <li>
                  <p>Add your current domain: <code className="bg-gray-200 px-2 py-1 rounded">{window.location.origin}</code></p>
                  <p className="text-sm text-gray-600 mt-1">Make sure to add the exact domain without any trailing slashes</p>
                </li>
                <li>
                  <p>Save your changes and refresh this page</p>
                </li>
              </ol>
              <div className="mt-6 p-4 border border-amber-200 bg-amber-50 rounded text-amber-800">
                <p className="font-bold">Important Note:</p>
                <p className="mt-1">Make sure that the Client ID you're using belongs to the correct project and is using the same network (sapphire_devnet).</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
        
        <AccordionItem value="setup" className="border-b">
          <AccordionTrigger className="text-lg font-medium">How to setup Web3Auth</AccordionTrigger>
          <AccordionContent className="text-base leading-relaxed">
            <ol className="list-decimal pl-5 space-y-4">
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
                <p>Open the file <code className="bg-gray-200 px-2 py-1 rounded">src/hooks/useWeb3Auth.tsx</code> in your codebase</p>
              </li>
              <li>
                <p>Replace the <code className="bg-gray-200 px-2 py-1 rounded">WEB3AUTH_CLIENT_ID</code> value with your Client ID</p>
                <p className="text-sm text-gray-600 mt-1">Look for this line: <code className="bg-gray-200 px-2 py-1 rounded">const WEB3AUTH_CLIENT_ID = '...';</code></p>
              </li>
              <li>
                <p>Configure allowed domains in your Web3Auth dashboard:</p>
                <p className="text-sm mt-1">Add this domain: <code className="bg-gray-200 px-2 py-1 rounded">{window.location.origin}</code></p>
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="network" className="border-b">
          <AccordionTrigger className="text-lg font-medium">Web3Auth Network Settings</AccordionTrigger>
          <AccordionContent className="text-base leading-relaxed">
            <p>The application is currently configured to use:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Network: <code className="bg-gray-200 px-2 py-1 rounded">sapphire_devnet</code></li>
              <li>Chain: <code className="bg-gray-200 px-2 py-1 rounded">Ethereum Mainnet (0x1)</code></li>
              <li>RPC Provider: <code className="bg-gray-200 px-2 py-1 rounded">Infura</code></li>
            </ul>
            <p className="mt-3">You can modify these settings in <code className="bg-gray-200 px-2 py-1 rounded">src/hooks/useWeb3Auth.tsx</code> if needed.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="troubleshooting">
          <AccordionTrigger className="text-lg font-medium">Troubleshooting</AccordionTrigger>
          <AccordionContent className="text-base leading-relaxed">
            <div className="space-y-5">
              <div>
                <p className="font-medium text-lg mb-2">If you're seeing domain whitelist errors:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <p>Ensure that the exact domain of this application is added to your Web3Auth project settings</p>
                  </li>
                  <li>
                    <p>The current domain is: <code className="bg-gray-200 px-2 py-1 rounded">{window.location.origin}</code></p>
                  </li>
                  <li>
                    <p>Check that you're using the correct Client ID that corresponds to the project where you've added the domain</p>
                  </li>
                  <li>
                    <p>Make sure your project is configured with the <code className="bg-gray-200 px-2 py-1 rounded">sapphire_devnet</code> network if using the default configuration</p>
                  </li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-lg mb-2">If you're experiencing a blank screen or application errors:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <p>Check the Browser Console for specific error messages (F12 or right-click → Inspect → Console)</p>
                  </li>
                  <li>
                    <p>Verify that your Web3Auth Client ID is correctly formatted</p>
                  </li>
                  <li>
                    <p>Try clearing your browser cache and local storage</p>
                  </li>
                  <li>
                    <p>If problems persist, try temporarily disabling the Web3Auth component by removing <code className="bg-gray-200 px-2 py-1 rounded">{`<Web3AuthProvider>`}</code> from App.tsx</p>
                  </li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-lg mb-2">If you're still seeing Client ID errors after updating it:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <p>Make sure you've replaced the entire <code className="bg-gray-200 px-2 py-1 rounded">WEB3AUTH_CLIENT_ID</code> placeholder string with your actual Client ID</p>
                  </li>
                  <li>
                    <p>Check that there are no extra spaces or characters in the Client ID</p>
                  </li>
                  <li>
                    <p>Verify that your Client ID follows the correct format from Web3Auth</p>
                  </li>
                  <li>
                    <p>Try refreshing the page after saving your changes</p>
                  </li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Web3AuthInstructions;


import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useWeb3Auth } from "@/hooks/useWeb3Auth";

const Web3AuthInstructions = () => {
  const { configError, domainError } = useWeb3Auth();
  
  return (
    <div className="mt-4 p-4 border rounded-md bg-gray-50">
      <Alert className={`mb-4 ${domainError ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
        <AlertCircle className={`h-4 w-4 ${domainError ? 'text-red-700' : 'text-amber-700'}`} />
        <AlertTitle className={domainError ? 'text-red-700' : 'text-amber-700'}>
          {domainError ? 'Domain Whitelisting Required' : 'Web3Auth Configuration Required'}
        </AlertTitle>
        <AlertDescription className={domainError ? 'text-red-700' : 'text-amber-700'}>
          {domainError 
            ? 'Your domain needs to be added to the allowed list in Web3Auth dashboard.'
            : 'To enable Web3Auth wallet functionality, you need to configure your Web3Auth Client ID.'}
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full" defaultValue={domainError ? "domain" : "setup"}>
        {domainError && (
          <AccordionItem value="domain">
            <AccordionTrigger>How to whitelist your domain</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <p>Log in to your <a href="https://dashboard.web3auth.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Web3Auth Dashboard</a></p>
                </li>
                <li>
                  <p>Select your project</p>
                </li>
                <li>
                  <p>Go to the "Whitelist Domains" section in your project settings</p>
                </li>
                <li>
                  <p>Add your current domain: <code className="bg-gray-200 px-1 rounded">{window.location.origin}</code></p>
                  <p className="text-xs text-gray-600 mt-1">Make sure to add the exact domain without any trailing slashes</p>
                </li>
                <li>
                  <p>Save your changes and refresh this page</p>
                </li>
              </ol>
              <div className="mt-4 p-3 border border-blue-200 bg-blue-50 rounded text-blue-800">
                <p className="text-sm"><strong>Note:</strong> If you're using the sample Client ID, you'll need to create your own project and use that Client ID instead. The sample Client ID is restricted to specific domains.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
        
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
                <p className="text-xs text-gray-600 mt-1">Note: Make sure to paste the entire Client ID without any trailing spaces</p>
              </li>
              <li>
                <p>Configure allowed domains in your Web3Auth dashboard:</p>
                <p className="text-sm mt-1">Add this domain: <code className="bg-gray-200 px-1 rounded">{window.location.origin}</code></p>
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
        
        <AccordionItem value="troubleshooting">
          <AccordionTrigger>Troubleshooting</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">If you're seeing domain whitelist errors:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>
                    <p>Ensure that the exact domain of this application is added to your Web3Auth project settings</p>
                  </li>
                  <li>
                    <p>The current domain is: <code className="bg-gray-200 px-1 rounded">{window.location.origin}</code></p>
                  </li>
                  <li>
                    <p>Check that you're using the correct Client ID that corresponds to the project where you've added the domain</p>
                  </li>
                  <li>
                    <p>Make sure your project is configured with the <code className="bg-gray-200 px-1 rounded">sapphire_devnet</code> network if using the default configuration</p>
                  </li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">If you're experiencing a blank screen or application errors:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>
                    <p>Check that the Browser Console for specific error messages</p>
                  </li>
                  <li>
                    <p>Verify that your Web3Auth Client ID is correctly formatted</p>
                  </li>
                  <li>
                    <p>Try clearing your browser cache and local storage</p>
                  </li>
                  <li>
                    <p>If problems persist, try temporarily disabling the Web3Auth component by removing <code className="bg-gray-200 px-1 rounded">{`<Web3AuthProvider>`}</code> from App.tsx</p>
                  </li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">If you're still seeing Client ID errors after updating it:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>
                    <p>Make sure you've replaced the entire <code className="bg-gray-200 px-1 rounded">WEB3AUTH_CLIENT_ID</code> placeholder string with your actual Client ID</p>
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

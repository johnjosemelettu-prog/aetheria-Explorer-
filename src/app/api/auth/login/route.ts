// This node is currently deactivated for Static Export compatibility.
// Move to a dedicated backend server for production deployment.
export const dynamic = 'force-static';

export async function GET() {
  return new Response(JSON.stringify({ message: "API Node Offline for Static Export" }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

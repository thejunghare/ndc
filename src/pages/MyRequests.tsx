import { useEffect, useState } from "react";
import { Button, Spinner } from "flowbite-react";
import { HiClipboardCopy } from "react-icons/hi";
import { supabase } from "../db/supabase";
import PropTypes from "prop-types";

const RequestItem = ({ req, copiedId, handleCopy }) => (
  <li className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold text-gray-700">
        Request ID: <span className="font-mono text-cyan-700">{req.id}</span>
      </p>
      <p
        className={`text-sm font-medium capitalize ${
          req.status === "approved"
            ? "text-green-600"
            : req.status === "rejected"
              ? "text-red-600"
              : "text-yellow-600"
        }`}
      >
        Status: {req.status}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Created: {new Date(req.created_at).toLocaleDateString()}
      </p>
    </div>
    <Button
      size="xs"
      color="gray"
      onClick={() => handleCopy(req.id)}
      aria-label={copiedId === req.id ? "Copied!" : "Copy request ID"}
      className="ml-4 flex-shrink-0"
    >
      <HiClipboardCopy className="mr-1" />
      {copiedId === req.id ? "Copied!" : "Copy"}
    </Button>
  </li>
);

const MyRequest = ({ currentUserId }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(5);

  const fetchRequests = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ndc_part_one")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setRequests(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await fetchRequests();
    };

    if (isMounted) loadData();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, limit]);

  const handleCopy = (requestId) => {
    navigator.clipboard.writeText(requestId);
    setCopiedId(requestId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        {/* <h2 className="text-2xl font-bold text-gray-800">My NDC Requests</h2> */}
        {requests.length > 0 && (
          <span className="text-sm text-gray-500">
            Showing {requests.length} requests
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-red-600">Error loading requests: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" aria-label="Loading requests..." />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg p-6 text-center">
          <p className="text-gray-500">No requests found.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {requests.map((req) => (
              <RequestItem
                key={req.id}
                req={req}
                copiedId={copiedId}
                handleCopy={handleCopy}
              />
            ))}
          </ul>

          {requests.length >= limit && (
            <div className="flex justify-center">
              <Button
                color="light"
                onClick={() => setLimit((prev) => prev + 5)}
                className="mt-4"
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

MyRequest.propTypes = {
  currentUserId: PropTypes.string.isRequired,
};

export default MyRequest;

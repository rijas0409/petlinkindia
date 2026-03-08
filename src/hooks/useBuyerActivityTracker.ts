import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrackingParams {
  entityType: "pet" | "product" | "vet";
  entityId: string | undefined;
  entityName?: string;
  entityImage?: string;
}

/**
 * Tracks buyer page views and time spent on entity pages.
 * Logs a page_view on mount and updates duration on unmount.
 */
const useBuyerActivityTracker = ({ entityType, entityId, entityName, entityImage }: TrackingParams) => {
  const startTime = useRef(Date.now());
  const activityIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!entityId) return;

    const logView = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("buyer_activity")
        .insert({
          user_id: session.user.id,
          activity_type: "page_view",
          entity_type: entityType,
          entity_id: entityId,
          entity_name: entityName || null,
          entity_image: entityImage || null,
          duration_seconds: 0,
        })
        .select("id")
        .single();

      if (!error && data) {
        activityIdRef.current = data.id;
      }
    };

    startTime.current = Date.now();
    logView();

    return () => {
      // Update duration on unmount
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      const aid = activityIdRef.current;
      if (aid && duration > 0) {
        // Fire-and-forget update
        supabase
          .from("buyer_activity")
          .update({ duration_seconds: duration })
          .eq("id", aid)
          .then(() => {});
      }
    };
  }, [entityId, entityType]);

  // Allow updating entity name/image after load
  useEffect(() => {
    if (!activityIdRef.current || (!entityName && !entityImage)) return;
    const updates: any = {};
    if (entityName) updates.entity_name = entityName;
    if (entityImage) updates.entity_image = entityImage;
    supabase
      .from("buyer_activity")
      .update(updates)
      .eq("id", activityIdRef.current)
      .then(() => {});
  }, [entityName, entityImage]);
};

export default useBuyerActivityTracker;

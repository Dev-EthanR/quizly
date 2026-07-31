interface HostReconnectingBannerProps {
  show: boolean;
}

function HostReconnectingBanner({ show }: HostReconnectingBannerProps) {
  if (!show) {
    return null;
  }

  return (
    <p className="mx-auto mb-6 w-fit rounded-full border border-warning/30 bg-warning/10 px-4 py-2 text-center text-sm font-medium text-warning">
      Host disconnected — waiting for them to reconnect...
    </p>
  );
}

export default HostReconnectingBanner;

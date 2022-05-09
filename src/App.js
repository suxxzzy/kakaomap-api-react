import { useState, useEffect } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";

/*global kakao*/
function App() {
  const [info, setInfo] = useState();
  const [pages, setPages] = useState([]);
  const [pageInfo, setPageInfo] = useState();
  const [dataList, setDataList] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState();

  useEffect(() => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let x = position.coords.longitude;
        let y = position.coords.latitude;
        console.log(x, y);
        const ps = new kakao.maps.services.Places();

        ps.keywordSearch(
          "꽃집",
          (data, status, _pagination) => {
            if (status === kakao.maps.services.Status.OK) {
              // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
              // LatLngBounds 객체에 좌표를 추가합니다
              const bounds = new kakao.maps.LatLngBounds();
              console.log(_pagination, "페이지 정보");
              //검색 목록, 페이지번호 보여주기
              let pageNums = [];
              for (let i = 1; i <= _pagination.last; i++) {
                pageNums.push(i);
              }
              let dataList = [];
              let markers = [];
              markers.push({
                position: {
                  lat: y,
                  lng: x,
                },
                content: "나의 현위치",
              });
              for (let i = 0; i < data.length; i++) {
                //검색 결과 목록
                dataList.push({
                  idx: i,
                  data: data[i],
                });

                //지도상 좌표 목록
                markers.push({
                  position: {
                    lat: data[i].y,
                    lng: data[i].x,
                  },
                  content: data[i].place_name,
                });
                bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
              }
              setPages(pageNums);
              setPageInfo(_pagination);
              setDataList(dataList);
              setMarkers(markers);

              // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
              map.setBounds(bounds);
              console.log(markers, "장소정보들");
            }
          },
          { x, y, radius: 1000 }
        );
      });
    }
  }, [map]);
  console.log(pages, pageInfo);
  const src = "https://cdn-icons-png.flaticon.com/512/381/381804.png", // 마커이미지의 주소입니다
    size = { width: 30, height: 30 }, // 마커이미지의 크기입니다
    options = { offset: new kakao.maps.Point(27, 69) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
  const markerImage = { src, size, options };
  return (
    <>
      <Map // 로드뷰를 표시할 Container
        center={{
          lat: 37.566826,
          lng: 126.9786567,
        }}
        style={{
          width: "400px",
          height: "350px",
        }}
        level={3}
        onCreate={setMap}
      >
        {markers.map((marker) => (
          <MapMarker
            key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
            position={marker.position}
            onMouseOver={() => setInfo(marker)}
            onMouseOut={() => setInfo()}
            image={markerImage}
          >
            {info && info.content === marker.content && (
              <div style={{ color: "#000" }}>{marker.content}</div>
            )}
          </MapMarker>
        ))}
      </Map>
      <ul className="searchResults">
        {dataList.map((item) => {
          return (
            <li key={item.id}>
              <div>{item.idx}</div>
              <h5>{item.data.place_name}</h5>
              {item.data.road_address_name ? (
                <span>{item.data.road_address_name}</span>
              ) : null}
              <span>{item.data.address_name}</span>
              <span>{item.data.phone}</span>
            </li>
          );
        })}
      </ul>
      <ul className="pages">
        {pages.map((page, idx) => {
          return idx + 1 === pageInfo.current ? (
            <a key={idx}>
              <li>{page}페이지를 보고있습니다</li>
            </a>
          ) : (
            <a
              key={idx}
              onClick={((page) => {
                return () => pageInfo.gotoPage(page);
              })(page)}
            >
              <li>{page}</li>
            </a>
          );
        })}
      </ul>
    </>
  );
}
export default App;
